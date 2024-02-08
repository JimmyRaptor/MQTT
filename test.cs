// convert byte array using cbor
            var cborPayload = new CborReader(bytePayload);
            cborPayload.ReadStartMap();

            var peek = cborPayload.PeekState();
            var count = 0;
            while (peek != CborReaderState.Finished && peek != CborReaderState.EndMap && count < 100)
            {
                count++;
                string key = "";
                string value = "";
                
                //Console.WriteLine(peek);

                if (peek == CborReaderState.UnsignedInteger)
                {
                    key = cborPayload.ReadInt32().ToString();
                    //Console.WriteLine(key);
                }if (peek == CborReaderState.NegativeInteger)
                {
                    key = cborPayload.ReadInt32().ToString();
                    //Console.WriteLine(key);
                } else if (peek == CborReaderState.TextString)
                {
                    key = cborPayload.ReadTextString();
                    //Console.WriteLine(key);
                }

                var peek2 = cborPayload.PeekState();

                if (peek2 == CborReaderState.DoublePrecisionFloat)
                {
                    value = cborPayload.ReadDouble().ToString();
                    //Console.WriteLine(value);

                    json.Add(key, value);
                } else if (peek2 == CborReaderState.UnsignedInteger)
                {
                    value = cborPayload.ReadInt32().ToString();
                    //Console.WriteLine(value);
                    
                    json.Add(key, value);
                }
                else if (peek2 == CborReaderState.NegativeInteger)
                {
                    value = cborPayload.ReadInt32().ToString();
                    //Console.WriteLine(value);

                    json.Add(key, value);
                }
                else if (peek2 == CborReaderState.EndMap)
                {
                    cborPayload.ReadEndMap();
                }
                
                peek = cborPayload.PeekState();
            }
            
            if (count >= 100)
            {
                Console.WriteLine("Error: count exceeded 100");
                return;
            }

            var timestamp = json["ts"];
            json.Remove("ts");

            if (json.ContainsKey("26") && double.Parse(json["26"]) < 0)
            {
                Console.WriteLine("Negative Easting detected!");
                return;
            }
            
            string jsonString = "{\n\"timestamp\": "+timestamp+",\n\"rdn\":{\n";
            

            foreach (var key in json.Keys)
            {
                //Console.WriteLine($"key: {key}, value: {json[key]} ");
                
                jsonString += $"\"{key}\": {json[key]},\n";
            }

            jsonString = jsonString.Remove(jsonString.Length - 2);
            jsonString += "},\n";
            jsonString += "\"state\": {\n        \"state\": \"Ready\",\n        \"activity\": \"Loading\",\n        \"location\" : \"RL90_1a\",\n        \"operator\": \"John Smith\",\n        \"dump_assign\":\"ROM1\",\n        \"load_assign\":\"EX1233\",\n        \"material\": \"Waste\"\n    },\n    \"globals\": {\n        \"ts_assign\": 12335425,\n        \"ts_config\": 12335425,\n        \"ts_gps\": 12335425,\n        \"ts_loc\": 12335425,\n        \"ts_log\": 12335425\n    },\n    \"p2p\": {\n        \"loading\": \"DT123\",\n        \"queue\": [\"DT332\",\"DT736\"],\n        \"support\": [\"DZ554\",\"DR532\"]\n    }\n}";
            
            Console.WriteLine(jsonString);