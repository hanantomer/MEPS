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
                context.Request.RequestType == "POST" ?
                "PUT" :
                context.Request.Form["_method"];

            string result = "[]";

            DBAccess db = DBAccess.GetInstance();

            if (entityType == "SolarPanels")
            {
                if (requestType == "GET")
                {
                    result =
                        db.getTableAsJson(
                            @"
                            SELECT 
                            [id],
                            [Name],
                            [Price],
                            [AnnualMaintenanceCost],
                            [AnnualOperationalDegradation],
                            [EnergyProductionCoefficient],
                            'solarPanel' Type  
                            FROM SolarPanel");
                }
            }

            if (entityType == "WindTurbines")
            {
                result =
                    db.getTableAsJson(
                        @"select id, Name, 
                        MinWindVelocity, 
                        MaxWindVelocity, 
                        MinCapacity, 
                        MaxCapacity, 
                        'windTurbine' Type  from WindTurbine");
            }

            if (entityType == "Configurations")
            {
                result =
                    db.getTableAsJson(
                        @"select id, Name, Place,
                        'configuration' Type  from Configuration");
            }


            if (entityType == "StorageTypes")
            {
                if (requestType == "GET")
                {
                    result =
                        db.getTableAsJson(
                            @"
                            SELECT [id]
                                  ,[Name]
                                  ,[Price]
                                  ,[MaxCapacity]
                                  ,[BatteryCapacity]
                                  ,[BatteryPower]
                                  ,[ChargeRate]
                                  ,[DischargeRate]
                                  ,[Efficiency]
                                  ,[AnnualyEfficiencyLoss]
                                  ,[Cycles]
                                  , 'storage'   Type
                              FROM [dbo].[Storage]");
                }
            }


            if (entityType == "coalPlantOperationModes")
            {
                if (requestType == "GET")
                {
                    result =
                        db.getTableAsJson("select id, Value as text from CoalPlantOperationMode");
                }
            }

            if (entityType == "coalPlant")
            {
                if (requestType == "GET")
                {
                    result =
                        db.GetCoalPlant(Convert.ToInt32(id));
                }

                if (requestType == "PUT")
                {
                    // add
                    if (String.IsNullOrEmpty(id))
                    {
                        int coalPlantId = db.AddComponent("CoalPlant");

                        result =
                            db.getTableAsJson("select * from CoalPlant where id = @id",
                                new KeyValuePair<string, string>[] {
                                    new KeyValuePair<string, string>(
                                        "id", coalPlantId.ToString())});
                    }
                    else
                    {

                        db.UpdateComponent(Convert.ToInt32(id), data, "CoalPlant");
                    }
                }

                if (requestType == "DELETE")
                {
                    db.DeleteComponent(id, "CoalPlant");
                }
            }

            if (entityType == "coalPlantState")
            {

                if (requestType == "PUT")
                {
                    db.UpdateCoalPlantState(data);
                }
            }


            if (entityType == "solarPanel")
            {
                if (requestType == "GET")
                {
                    result =
                        db.GetSolarPanel(Convert.ToInt32(id));
                }

                if (requestType == "PUT")
                {
                    // add
                    if (String.IsNullOrEmpty(id))
                    {
                        int solarPanelId = db.AddComponent("SolarPanel");

                        result =
                            db.getTableAsJson("SELECT * from SolarPanel WHERE id = @id",
                                new KeyValuePair<string, string>[] {
                                    new KeyValuePair<string, string>(
                                        "id", solarPanelId.ToString())});
                    }
                    else
                    {

                        db.UpdateComponent(Convert.ToInt32(id), data, "SolarPanel");
                    }
                }

                if (requestType == "DELETE")
                {
                    db.DeleteComponent(id, "SolarPanel");
                }
            }



            if (entityType == "windTurbine")
            {
                if (requestType == "GET")
                {
                    result =
                        db.GetWindTurbine(Convert.ToInt32(id));
                }

                if (requestType == "PUT")
                {
                    // add
                    if (String.IsNullOrEmpty(id))
                    {
                        int windTurbineid = db.AddComponent("WindTurbine");

                        result =
                            db.getTableAsJson("select * from WindTurbine where id = @id",
                                new KeyValuePair<string, string>[] {
                                    new KeyValuePair<string, string>(
                                        "id", windTurbineid.ToString())});
                    }
                    else
                    {

                        db.UpdateComponent(Convert.ToInt32(id), data, "WindTurbine");
                    }
                }

                if (requestType == "DELETE")
                {
                    db.DeleteComponent(id, "WindTurbine");
                }
            }

            if (entityType == "storage")
            {
                if (requestType == "GET")
                {
                    result =
                        db.GetStorage(Convert.ToInt32(id));
                }

                if (requestType == "PUT")
                {
                    // add
                    if (String.IsNullOrEmpty(id))
                    {
                        int storageId = db.AddComponent("Storage");

                        result =
                            db.getTableAsJson("SELECT * from Storage WHERE id = @id",
                                new KeyValuePair<string, string>[] {
                                    new KeyValuePair<string, string>(
                                        "id", storageId.ToString())});
                    }
                    else
                    {

                        db.UpdateComponent(Convert.ToInt32(id), data, "Storage");
                    }
                }

                if (requestType == "DELETE")
                {
                    db.DeleteComponent(id, "Storage");
                }
            }

            if (entityType == "configuration")
            {
                ProcessItemRequest(requestType, "configuration", id, data, out result);

            }


            context.Response.ContentType = "text/json";

            context.Response.Write(result);
        }

        private void  ProcessItemRequest(String requestType, String itemType, String id, String data, out String result)
        {
            DBAccess db = DBAccess.GetInstance();

            result = "[]";

            if (requestType == "GET")
            {
                result =
                    db.GetStorage(Convert.ToInt32(id));
            }

            if (requestType == "PUT")
            {
                // add
                if (String.IsNullOrEmpty(id))
                {
                    int newId = db.AddComponent(itemType);

                    result =
                        db.getTableAsJson(String.Format("SELECT * from {0} WHERE id = @id", itemType),
                            new KeyValuePair<string, string>[] {
                                    new KeyValuePair<string, string>(
                                        "id", newId.ToString())});
                }
                else
                {

                    db.UpdateComponent(Convert.ToInt32(id), data, itemType);
                }
            }

            if (requestType == "DELETE")
            {
                db.DeleteComponent(id, "Storage");
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