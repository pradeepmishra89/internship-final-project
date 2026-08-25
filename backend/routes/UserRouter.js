import { handleAddUser, handleChangePassword, handleDeleteUser, handleGetAllUsers, handleGetUserByEmail, handleGetUserById, handleUpdateUser,login,logout} from "../controller/UserController.js";
import { authMiddleware } from "../middleware/middleware.js";
import { chat ,getChatHistory} from "../controller/chatController.js";
import express from 'express'

export const router = express.Router();

router.get('/user',handleGetAllUsers);

router.get('/user/:id',handleGetUserById);

router.get('/user-email',handleGetUserByEmail);

router.post('/user',handleAddUser);

router.put('/update/:id',handleUpdateUser);

router.delete('/user/:id',handleDeleteUser);

router.patch('/change-password/:id',handleChangePassword)

router.post('/login',login)
router.put("/logout/:id", logout);

router.post( '/chat', authMiddleware,chat);

router.get("/chat/history",authMiddleware,getChatHistory);

router.get("/test", (req, res)=>{
    res.send("im working")
})