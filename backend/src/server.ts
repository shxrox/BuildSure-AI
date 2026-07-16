import "dotenv/config";

import app from "./app";
import connectDatabase from "./config/database";


const PORT =
  Number(process.env.PORT) || 5000;


const startServer = async (): Promise<void> => {

  await connectDatabase();


  app.listen(PORT, () => {

    console.log(
      `BuildSure-AI Server running on port ${PORT}`
    );

  });

};


startServer();