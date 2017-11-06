using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
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



        public string getTableAsJson(string sql, KeyValuePair<string, string>[] parameters = null)
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
                        cmd.Parameters.AddWithValue(param.Key, param.Value.Trim());
                    }
                }

                SqlDataAdapter adapter = new SqlDataAdapter(cmd);

                DataTable dt = new DataTable();

                adapter.Fill(dt);

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

        internal int AddComponent(string tableName)
        {
            SqlConnection conn = GetConnection();

            SqlCommand cmd = new SqlCommand();

            cmd.Connection = conn;

            string sql =
                String.Format(
                @"INSERT {0}(Name) VALUES('') SELECT IDENT_CURRENT ('{0}')",
                tableName);

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

        internal string GetSolarPanel(int id)
        {
            return GetComponent(id,
                @"SELECT 
                    [Id],
                    [Name],
                    [Price],
                    [AnnualMaintenanceCost],
                    [AnnualOperationalDegradation],
                    [EnergyProductionCoefficient]
                FROM [SolarPanel] WHERE id = @id");
        }



        internal string GetCoalPlant(int id)
        {
            SqlConnection conn = GetConnection();

            try
            {

                string sql = 
                    @"
                    SELECT id, Name, Capacity 
                    FROM CoalPlant 
                    WHERE id = @id";

                SqlCommand cmd = new SqlCommand(sql, conn);

                cmd.Parameters.AddWithValue("id", id);

                SqlDataAdapter adapter = new SqlDataAdapter(cmd);

                DataTable dt = new DataTable();

                adapter.Fill(dt);

                // add states 

                dt.Columns.Add("States", typeof(DataTable));

                sql =
                    @"select 
                    s.id,
                    CoalPlantId,
                    m.Id CoalPlantOperationModeId,
                    m.Value CoalPlantOperationModeName,
                    s.CoalBurningPercentage,
                    s.MinutesToFullLoad,
                    s.EmissionPercentage,
                    s.CostPerHourPercentage
                    from CoalPlantOperationMode m
                    left join CoalPlantState s on s.CoalPlantOperationModeId = m.Id
                    and s.CoalPlantId = @id
                    order by m.ord";

                cmd.CommandText = sql;

                DataTable dt1 = new DataTable();

                adapter = new SqlDataAdapter(cmd);

                adapter.Fill(dt1);

                dt.Rows[0]["States"] = dt1;

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

        internal string GetWindTurbine(int id)
        {
            SqlConnection conn = GetConnection();

            try
            {

                string sql =
                    @"
                    SELECT * 
                    FROM WindTurbine                    WHERE id = @id";

                SqlCommand cmd = new SqlCommand(sql, conn);

                cmd.Parameters.AddWithValue("id", id);

                SqlDataAdapter adapter = new SqlDataAdapter(cmd);

                DataTable dt = new DataTable();

                adapter.Fill(dt);

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


        internal string GetStorage(int id)
        {
            SqlConnection conn = GetConnection();

            try
            {

                string sql =
                    @"
                    SELECT * 
                    FROM Storage  WHERE id = @id";

                SqlCommand cmd = new SqlCommand(sql, conn);

                cmd.Parameters.AddWithValue("id", id);

                SqlDataAdapter adapter = new SqlDataAdapter(cmd);

                DataTable dt = new DataTable();

                adapter.Fill(dt);

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

        internal void UpdateComponent(int id, string data, string tableName)
        {
            SqlConnection conn = GetConnection();

            SqlCommand cmd = new SqlCommand();

            cmd.Connection = conn;

            dynamic componenet = Newtonsoft.Json.JsonConvert.DeserializeObject(data);

            string set = String.Empty;

            foreach (var item in componenet)
            {
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
