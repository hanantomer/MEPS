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
    class UploadHelper
    {

        private UploadHelper()
        {
        }

        private static object _lock = new object();

        private static UploadHelper _instance = null;

        public static UploadHelper GetInstance()
        {
            lock (_lock)
            {
                if (_instance == null)
                {
                    _instance = new UploadHelper();
                }

                return _instance;
            }
        }

        internal void Upload(string fileName)
        {
        }

    }
}
