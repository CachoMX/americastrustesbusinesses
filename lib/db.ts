import sql from 'mssql'

const config: sql.config = {
  server: '192.185.7.4',
  database: 'benjaise_BCA',
  user: 'benjaise_sqluser',
  password: 'Aragon21!',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 60000,
  connectionTimeout: 60000,
  port: 1433,
}

let poolPromise: Promise<sql.ConnectionPool>

const initializePool = () => {
  const pool = new sql.ConnectionPool(config)
  
  pool.on('error', (err) => {
    console.error('Database pool error:', err)
  })

  return pool.connect().catch((err) => {
    console.error('Database connection failed:', err)
    // Return a rejected promise to prevent further operations
    return Promise.reject(err)
  })
}

if (!global.poolPromise) {
  global.poolPromise = initializePool()
}
poolPromise = global.poolPromise

export { sql, poolPromise }