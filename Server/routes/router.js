const express = require("express");
const route = express.Router();

const services = require("../services/render");
const auth=require("../controllers/auth")
route.get("/", services.homeRoutes);

route.get("/video_chat", services.video_chat);
route.get("/text_chat", services.text_chat);

route.get("/users",auth.createuser)

route.put("/leavinguser/:id",auth.leavinguser)
route.put("/revisiting/:id",auth.revisitinguser)

route.get("/remoteuser/:id",auth.findremoteusers)

route.put("/update/:id",auth.updatestatus)

route.put("/updateonnext/:id",auth.updateonnext)

route.post("/getnextuser",auth.nextuser)


module.exports = route;
