import express from "express"
import serverless from "serverless-http"
import routes from "../src/routes"

const app = express()

app.use(express.json())
app.use("/api", routes)

export const handler = serverless(app)