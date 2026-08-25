import { db } from "../config/db_connect.js";

export const getAllUsers = async () => {
  const [rows] = await db.query("SELECT * FROM users");
  return rows;
};

export const getUserById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
};

export const getUserByEmail = async (email) => {

    const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    return rows[0] || null;
};


export const addUser = async (name, email, contact, age, password) => {
  const [result] = await db.execute(
    "INSERT INTO users (name, email, contact,age,password) VALUES (?, ?, ?, ?, ?)",
    [name, email, contact, age, password]
  );
  return result; // returns result object containing insertId
};

export const updateUser = async ( name, email, contact, age,id) => {
  const [result] = await db.execute(
    "UPDATE users SET name = ?, email = ?, contact = ?, age = ? WHERE id = ?",
    [name, email, contact, age ,id]
  );
  return result; // returns result object containing affectedRows
};

export const deleteUser = async (id) => {
  const [result] = await db.execute(
    "DELETE FROM users WHERE id = ?",
    [id]
  );
  return result; // returns result object containing affectedRows
};

export const changePassword = async (id, newPassword) => {

    const [result] = await db.execute(
        "UPDATE users SET password = ? WHERE id = ?",
        [newPassword, id]
    );

    return result;
};

export const updateToken = async (id, token) => {

    const [result] = await db.execute(
        "UPDATE users SET token = ? WHERE id = ?",
        [token, id]
    );

    return result;
};

export const logoutUser = async (id) => {

    const [result] = await db.execute(
        "UPDATE users SET token = NULL WHERE id = ?",
        [id]
    );

    return result;
};

export const saveChat = async (
    userId,
    userMessage,
    aiResponse
) => {

    const [result] = await db.execute(
        `INSERT INTO chat_history
        (user_id, user_message, ai_response)
        VALUES (?, ?, ?)`,
        [userId, userMessage, aiResponse]
    );

    return result;
};

export const getChatHistoryByUserId = async (userId) => {

    const [rows] = await db.execute(
        `SELECT
            u.id AS user_id,
            u.name,
            u.email,
            ch.id AS chat_id,
            ch.user_message,
            ch.ai_response,
            ch.created_at
         FROM users u
         INNER JOIN chat_history ch
         ON u.id = ch.user_id
         WHERE u.id = ?
         ORDER BY ch.created_at ASC`,
        [userId]
    );

    return rows;
};