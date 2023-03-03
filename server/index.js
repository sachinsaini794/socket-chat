const express = require("express")
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRouter = require("./Routes/userRoutes");
const chatRouter = require("./Routes/chatRoutes");
const messageRouter = require("./Routes/messageRoutes");

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("Welcome our chat");
});

app.use("/api/users", userRouter);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);





const port = process.env.PORT || 5000;

app.listen(port, (req, res ) => {
    console.log(`server running on port: ${port}`);
});


mongoose.set('strictQuery', true);
mongoose
  .connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connection Successfully!"))
  .catch((err) => {
    console.log(err);
    console.log("DB Connection Error!");
  });