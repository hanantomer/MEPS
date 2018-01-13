using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EGPServer
{
    /// <summary>
    /// Summary description for Handler
    /// </summary>
    public class Handler : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            string entityType = context.Request.Params["entityType"];

            string parentFieldName = context.Request.Params["parentFieldName"];

            string parentFieldValue = context.Request.Params["parentFieldValue"];

            string detailsTableName = context.Request.Params["detailsTableName"];

            bool select2 = context.Request.Params["select2"] != null; 

            if (string.IsNullOrEmpty(entityType))
            {
                throw new ArgumentNullException("Handler must be supplied with a request parameter named : entityType");
            }

            string id = context.Request.Params["id"];

            // prefix

            string prefix = context.Request.Params["q"];

            // backbone sends data in "model" key

            string data = context.Request.Form["model"];

            string requestType =
                context.Request.Headers["X-HTTP-Method-Override"] == "DELETE" ?
                "DELETE" :
                context.Request.RequestType == "GET" ?
                "GET" :
                context.Request.RequestType == "POST" || context.Request.RequestType == "PATCH" ?
                "PUT" :
                context.Request.Form["_method"];

            string result = "[]";

            DBAccess db = DBAccess.GetInstance();

            if (requestType == "GET")
            {
                result = ProcessGetRequest(entityType, id, select2, parentFieldName, parentFieldValue, detailsTableName);
            }
            else
            {
                result = ProcessPostRequest(requestType, entityType, id, data, context.Request.Files, parentFieldValue);
            }


            context.Response.ContentType = "text/json";

            context.Response.Write(result);
        }

        private string  ProcessPostRequest(String requestType, String itemType, String id, String data, HttpFileCollection files, string parentFieldValue)
        {
            DBAccess db = DBAccess.GetInstance();

            String result = "[]";

            if (requestType == "PUT")
            {
                if (itemType == "importWindTurbines")
                {
                    db.ImportWindTurbines(files, parentFieldValue);
                }

                else
                {
                    // add
                    if (String.IsNullOrEmpty(id))
                    {

                        string parentFieldName = null;

                        dynamic component = Newtonsoft.Json.JsonConvert.DeserializeObject(data);

                        foreach (var item in component)
                        {
                            if (item.Name == "parentFieldName")
                            {

                                parentFieldName = item.Value.Value;
                            }

                            if (item.Name == "parentFieldValue")
                            {

                                parentFieldValue = item.Value.Value;
                            }
                        }


                        int newId = db.AddComponent(itemType, parentFieldName, parentFieldValue);

                        result =
                            db.getTableAsJson(
                                String.Format("SELECT * from {0} WHERE id = @id", itemType),
                                "",
                                "",
                                new KeyValuePair<string, string>[] {
                                    new KeyValuePair<string, string>(
                                        "id", newId.ToString())});
                    }
                    else
                    {

                        db.UpdateComponent(Convert.ToInt32(id), data, itemType);
                    }
                }
            }

            if (requestType == "DELETE")
            {
                db.DeleteComponent(id, itemType);
            }

            return result;
        }

        private string ProcessGetRequest(String entityType, String id, bool select2, string parentFieldName, string parentFieldValue, string detailsTableName)
        {
            if (entityType.ToLower().StartsWith("sys"))
                return null;

            ///TODO assert valid table name to avoid injection


            KeyValuePair<String, String> prmId = new KeyValuePair<string, string>();
            KeyValuePair<String, String> prmParent = new KeyValuePair<string, string>();

            if (!String.IsNullOrEmpty(id))
            {
                prmId = new KeyValuePair<String, String>("id", id);
            }


            DBAccess db = DBAccess.GetInstance();

            String where =
                String.IsNullOrEmpty(id) ? "" : " AND id=@id ";


            string parentWhere = "";

            if(!String.IsNullOrEmpty(parentFieldName))
            {
                parentWhere = String.Format(" AND {0}=@{0} ", parentFieldName);
                prmParent = new KeyValuePair<String, String>(parentFieldName, parentFieldValue);
            }

            if(select2)
            {
                string results =
                    db.getTableAsJson(
                        String.Format("SELECT id, name as text from {0} WHERE 1=1 {1} ", entityType, parentWhere), 
                        "",
                        "",
                        prmId, 
                        prmParent);

                results = String.Format("{0}\"results\":{1} {2}", "{", results, "}");
                return results;
            }
            else
            {
                return db.getTableAsJson(
                    String.Format("SELECT '{0}' as entityType, * from {0} WHERE 1=1 {1} {2}  ", entityType, where, parentWhere),
                    entityType,
                    detailsTableName,
                    prmId, 
                    prmParent);
            }
        }


        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}