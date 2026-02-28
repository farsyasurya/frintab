import express from "express"
import cors from "cors"
import serverless from "serverless-http"
import routes from "../src/routes"

const app = express()

app.use(cors({
  origin: [
    "http://localhost:5173", // frontend local kamu
    // "https://namafrontend.vercel.app" 
  ],
  credentials: true
}))

app.options("*", cors())

app.use(express.json())
app.use("/api", routes)

export const handler = serverless(app)