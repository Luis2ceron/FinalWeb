// Definición básica de esquema para usuarios en JavaScript puro

// Estructura de la tabla de usuarios
export const users = {
  tableName: "users",
  fields: {
    id: { name: "id", type: "serial", primaryKey: true },
    username: { name: "username", type: "text", notNull: true, unique: true },
    password: { name: "password", type: "text", notNull: true }
  }
};

// Función para validar datos de inserción
export function validateInsertUser(userData) {
  // Validación básica
  if (!userData.username || typeof userData.username !== 'string') {
    throw new Error('El nombre de usuario es requerido y debe ser texto');
  }
  
  if (!userData.password || typeof userData.password !== 'string') {
    throw new Error('La contraseña es requerida y debe ser texto');
  }
  
  return {
    username: userData.username,
    password: userData.password
  };
}

// Esquema para insertar usuario (equivalente a insertUserSchema)
export const insertUserSchema = {
  validate: validateInsertUser
};

// Los tipos se convierten en comentarios para JavaScript
// InsertUser: { username: string, password: string }
// User: { id: number, username: string, password: string }