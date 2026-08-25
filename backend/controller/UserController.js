import jwt from 'jsonwebtoken'
import { 
  addUser, 
  getAllUsers, 
  getUserById, 
  getUserByEmail, 
  deleteUser, 
  changePassword, 
  updateUser ,
  updateToken,
  logoutUser
} from "../models/model.js";
import bcrypt from 'bcrypt';

export const handleGetAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    
    const safeUsers = users.map(({ password, ...rest }) => rest);
    
    return res.status(200).json({ success: true, data: safeUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGetUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User ID does not exist"
      });
    }

    const { password, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGetUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User email does not exist"
      });
    }

    const { password, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleAddUser = async (req, res) => {
  try {
    const { name, email, contact, age,password } = req.body;

    if (!name || !email || !contact || !age || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashPass = await bcrypt.hash(password, 10);
    const result = await addUser(name, email, contact, age, hashPass);

    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Failed to create user"
      });
    }

    return res.status(201).json({
      success: true,
      message: "User added successfully",
      data: { id: result.insertId, name, email, contact, age }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    // console.log(id);
    // console.log(user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (req.body.email && req.body.email !== user.email) {
      const emailTaken = await getUserByEmail(req.body.email);
      if (emailTaken) {
        return res.status(409).json({
          success: false,
          message: "Email is already taken by another account"
        });
      }
    }

    const updateName = req.body.name ?? user.name;
    const updateEmail = req.body.email ?? user.email;
    const updateContact = req.body.contact ?? user.contact;
    const updateAge = req.body.age ?? user.age;

    const result = await updateUser(
      updateName,
      updateEmail,
      updateContact,
      updateAge,
      id
    );

    // console.log(result)
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "User not updated or no changes made"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const handleDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteUser(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleChangePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required"
      });
    }

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist"
      });
    }

    if (oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Incorrect existing password"
        });
      }
    }
    //    console.log(password)
    const updatePassword = await bcrypt.hash(password, 10);
    const result = await changePassword(id, updatePassword);

    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Failed to change password"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const result = await getUserByEmail(email);

        if (!result) {
            return res.status(401).json({
                success: false,
                message: "Email or password incorrect"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            result.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Email or password incorrect"
            });
        }

       const token = jwt.sign(
    { 
        id: result.id, 
        email: result.email 
    },
    process.env.JWT_SECRET,
    { 
        expiresIn: "1d" 
    }
);

await updateToken(result.id, token);
       return res.status(200).json({
    success: true,
    message: "Login successful",
    token
});

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await logoutUser(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};