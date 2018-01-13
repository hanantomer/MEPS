using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Web;

namespace EGPServer
{
    class DBAccess
    {

        private DBAccess()
        {
            _connString = ConfigurationManager.ConnectionStrings["CnnStr"].ConnectionString;

        }

        private static object _lock = new object();

        private static DBAccess _instance = null;

        public static DBAccess GetInstance()
        {
            lock (_lock)
            {
                if (_instance == null)
                {
                    _instance = new DBAccess();
                }

                return _instance;
            }
        }

        string _connString = String.Empty;


        private SqlConnection GetConnection()
        {
            SqlConnection conn = new SqlConnection(_connString);
            conn.Open();
            return conn;
        }



        public string getTableAsJson(string sql, string tableName, string detailsTableName, params KeyValuePair<string, string>[]  parameters)
        {
            SqlConnection conn = GetConnection();

            try
            {
                SqlCommand cmd = new SqlCommand(sql, conn);

                // bind parameters

                if (parameters != null)
                {
                    foreach (KeyValuePair<string, string> param in parameters)
                    {
                        if (param.Key != null)
                        {
                            cmd.Parameters.AddWithValue(param.Key, param.Value.Trim());
                        }
                    }
                }

                SqlDataAdapter adapter = new SqlDataAdapter(cmd);

                DataTable dt = new DataTable();

                adapter.Fill(dt);

                if(! String.IsNullOrEmpty(detailsTableName))
                {
                    DataTable dtDetails = new DataTable();

                    string detailsSql =
                        string.Format("SELECT * FROM {0} where {1} = @id", detailsTableName, tableName + "Id", tableName);

                    cmd.CommandText = detailsSql;

                    cmd.Parameters.Clear();

                    cmd.Parameters.Add(new SqlParameter("id", SqlDbType.Int));

                    dt.Columns.Add(detailsTableName, typeof(DataTable));

                    foreach (DataRow dr in dt.Rows)
                    {
                        cmd.Parameters[0].Value = Convert.ToInt32(dr[1]);

                        adapter.Fill(dtDetails);

                        dr[detailsTableName] = dtDetails;
                    }
                }

                // serialyze to json

                string json = Newtonsoft.Json.JsonConvert.SerializeObject(dt, Formatting.Indented);

                return json;
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                conn.Close();
            }
        }

        internal int AddComponent(string tableName, string parentFieldName, string parentFieldValue)
        {
            SqlConnection conn = GetConnection();

            SqlCommand cmd = new SqlCommand();

            cmd.Connection = conn;

            string sql =
                String.Format(
                @"INSERT {0}(Name {1}) VALUES('' {2}) SELECT IDENT_CURRENT ('{0}')",
                tableName,
                String.IsNullOrEmpty( parentFieldName) ? String.Empty : "," + parentFieldName,
                String.IsNullOrEmpty(parentFieldValue) ? String.Empty : "," + parentFieldValue);

            cmd.CommandText = sql;

            try
            {
                return Convert.ToInt32(cmd.ExecuteScalar());
            }
            finally
            {
                conn.Close();
            }
        }


        private string GetComponent(int id, string sql)
        {
            SqlConnection conn = GetConnection();

            try
            {

                SqlCommand cmd = new SqlCommand(sql, conn);

                cmd.Parameters.AddWithValue("id", id);

                SqlDataAdapter adapter = new SqlDataAdapter(cmd);

                DataTable dt = new DataTable();

                adapter.Fill(dt);

                cmd.CommandText = sql;

                DataTable dt1 = new DataTable();

                adapter = new SqlDataAdapter(cmd);

                adapter.Fill(dt1);

                string json = Newtonsoft.Json.JsonConvert.SerializeObject(dt, Formatting.Indented);

                return json;
            }
            finally
            {
                conn.Close();
            }
        }

        internal void ImportWindTurbines(HttpFileCollection files, string parentFieldValue)
        {
            foreach (string fileName in files)
            {
                Stream stream = ((HttpPostedFile)files[fileName]).InputStream;
                StreamReader streamReader = new StreamReader(stream);
                string fileContent = streamReader.ReadToEnd();
                ImportWindTurbineFile(fileName, fileContent, parentFieldValue);
            }
        }

        private void ImportWindTurbineFile(string fialeName, string fileContent, string parentFieldValue)
        {
            string[] lines = fileContent.Split('\n');

            String name = lines[0].Trim().Replace("\"","");
            float bladeDiameter = float.Parse(lines[1].Trim().Replace("\"", ""));
            float maxWindVelocity = float.Parse(lines[3].Trim().Replace("\"", ""));
            float minWindVelocity = float.Parse(lines[4].Trim().Replace("\"", ""));

            List<KeyValuePair<int, float>> powerCurve = new List<KeyValuePair<int, float>>();

            for (int i = 5; i < lines.Length; i++)
            {
                float power = 0;
                if (float.TryParse(lines[i].Trim().Replace("\"", ""), out power))
                {
                    powerCurve.Add(new KeyValuePair<int, float>(i - 4, power));
                }
            }

            SqlConnection conn = GetConnection();

            SqlCommand cmd = new SqlCommand();


            string sql =
                @"
                IF NOT EXISTS(SELECT 1 FROM WindTurbine where name = @name)
                
                INSERT WindTurbine(Name, MinWindVelocity, MaxWindVelocity, BladeDiameter, WindTurbineSupplierId) 
                VALUES(@name, @minWindVelocity, @maxWindVelocity, @bladeDiameter, @windTurbineSupplierId)

                DELETE WindTurbinePowerCurve WHERE WindTurbineId = (SELECT id FROM WindTurbine WHERE name = @name)

                UPDATE WindTurbine 
                SET Name = @name, MinWindVelocity = @minWindVelocity, 
                    MaxWindVelocity = @maxWindVelocity, BladeDiameter = @bladeDiameter
                WHERE name = @name";


            cmd.CommandText = sql;
            cmd.Connection = conn;

            cmd.Parameters.AddWithValue("name", name);
            cmd.Parameters.AddWithValue("minWindVelocity", minWindVelocity);
            cmd.Parameters.AddWithValue("maxWindVelocity", maxWindVelocity);
            cmd.Parameters.AddWithValue("bladeDiameter", bladeDiameter);
            cmd.Parameters.AddWithValue("windTurbineSupplierId", parentFieldValue);

            cmd.ExecuteNonQuery();

            for (int i = 0; i < powerCurve.Count; i++)
            {
                sql = @"
                INSERT WindTurbinePowerCurve(WindTurbineId, WindVelocity, Power)
                VALUES((select id from WindTurbine where name = @name), @WindVelocity, @power)";

                cmd.Parameters.Clear();

                cmd.CommandText = sql;

                cmd.Parameters.AddWithValue("name", name);
                cmd.Parameters.AddWithValue("WindVelocity", powerCurve[i].Key);
                cmd.Parameters.AddWithValue("power", powerCurve[i].Value);

                cmd.ExecuteNonQuery();
            }
        }

        internal void UpdateComponent(int id, string data, string tableName)
        {
            SqlConnection conn = GetConnection();

            SqlCommand cmd = new SqlCommand();

            cmd.Connection = conn;

            dynamic component = Newtonsoft.Json.JsonConvert.DeserializeObject(data);

            string set = String.Empty;

            foreach (var item in component)
            {
                if (item.Name == "id" || item.Name == "entityType" || item.Name == "Type" || item.Name == "UserId")
                    continue;
                if (set.Length > 0)
                    set += ", ";

                set += item.Name + "= @" + item.Name;

                cmd.Parameters.AddWithValue("@" + item.Name, item.Value.Value);
            }

            string sql =
                String.Format(
                @"Update {0} set 
                {1}                
                WHERE Id = @Id", tableName, set);

            cmd.CommandText = sql;

            cmd.Parameters.AddWithValue("Id", id);

            cmd.ExecuteNonQuery();
        }

       

        internal void UpdateCoalPlantState(string data)
        {
            SqlConnection conn = GetConnection();

            SqlCommand cmd = new SqlCommand();

            cmd.Connection = conn;

            dynamic coalPlantState =
                Newtonsoft.Json.JsonConvert.DeserializeObject(data);

            cmd.Parameters.AddWithValue("coalPlantId", coalPlantState.CoalPlantId.Value);

            cmd.Parameters.AddWithValue("coalPlantOperationModeId", coalPlantState.CoalPlantOperationModeId.Value);

            string set = String.Empty;

            foreach (var item in coalPlantState)
            {
                if ( item.Name == "CoalBurningPercentage"   ||
                    item.Name == "MinutesToFullLoad"        ||
                    item.Name == "EmissionPercentage"       ||
                    item.Name == "CostPerHourPercentage" )
                {
                    if (item.Value.Value != null)
                    {
                        if (set.Length > 0) set += ",";
                        set += item.Name + "= @" + item.Name;
                        cmd.Parameters.AddWithValue("@" + item.Name, item.Value.Value);
                    }
                }
            }

            string sql =
            String.Format(
                @"
                IF NOT EXISTS(SELECT 1 FROM CoalPlantState where CoalPlantId = @coalPlantId 
                            AND CoalPlantOperationModeId = @coalPlantOperationModeId)
                
                INSERT CoalPlantState(CoalPlantId, CoalPlantOperationModeId) 
                VALUES(@coalPlantId, @coalPlantOperationModeId)

                UPDATE CoalPlantState SET {0}

                WHERE CoalPlantId = @coalPlantId
                AND CoalPlantOperationModeId = @coalPlantOperationModeId",
                set);

            cmd.CommandText = sql;

            int y = cmd.ExecuteNonQuery();
        }


        internal void DeleteComponent(string id, string tableName)
        {
            SqlConnection conn = GetConnection();

            SqlCommand cmd = new SqlCommand();

            cmd.Connection = conn;

            string sql =
                String.Format(
                @"
                DELETE {0} WHERE Id = @Id",
                tableName);

            cmd.CommandText = sql;

            cmd.Parameters.AddWithValue("Id", id);

            cmd.ExecuteNonQuery();
        }

    }
}
