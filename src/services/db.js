import { openDB } from 'idb'

const DB_NAME = 'SoclesDB'
const DB_VERSION = 1

// Store names
const STORES = {
  SOCLES: 'socles',
  USERS: 'users',
  SETTINGS: 'settings'
}

/**
 * Initialize and open the IndexedDB database
 * @returns {Promise} Database instance
 */
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create socles store
      if (!db.objectStoreNames.contains(STORES.SOCLES)) {
        const soclesStore = db.createObjectStore(STORES.SOCLES, {
          keyPath: 'id',
          autoIncrement: true
        })
        soclesStore.createIndex('inventoryNumber', 'inventoryNumber', { unique: false })
        soclesStore.createIndex('exposition', 'exposition', { unique: false })
        soclesStore.createIndex('isDraft', 'isDraft', { unique: false })
      }
      
      // Create users store
      if (!db.objectStoreNames.contains(STORES.USERS)) {
        db.createObjectStore(STORES.USERS, {
          keyPath: 'email'
        })
      }
      
      // Create settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, {
          keyPath: 'key'
        })
      }
    }
  })
}

/**
 * Socle operations
 */
export const soclesDB = {
  /**
   * Get all socles
   * @returns {Promise<Array>} Array of all socles
   */
  async getAll() {
    const db = await initDB()
    return db.getAll(STORES.SOCLES)
  },
  
  /**
   * Get a socle by ID
   * @param {number} id - Socle ID
   * @returns {Promise<Object>} Socle object
   */
  async getById(id) {
    const db = await initDB()
    return db.get(STORES.SOCLES, id)
  },
  
  /**
   * Create a new socle
   * @param {Object} socle - Socle data
   * @returns {Promise<number>} Created socle ID
   */
  async create(socle) {
    const db = await initDB()
    return db.add(STORES.SOCLES, {
      ...socle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  },
  
  /**
   * Update an existing socle
   * @param {Object} socle - Socle data with id
   * @returns {Promise<number>} Updated socle ID
   */
  async update(socle) {
    const db = await initDB()
    return db.put(STORES.SOCLES, {
      ...socle,
      updatedAt: new Date().toISOString()
    })
  },
  
  /**
   * Delete a socle
   * @param {number} id - Socle ID to delete
   * @returns {Promise<void>}
   */
  async delete(id) {
    const db = await initDB()
    return db.delete(STORES.SOCLES, id)
  },
  
  /**
   * Search socles by inventory number
   * @param {string} inventoryNumber - Inventory number to search
   * @returns {Promise<Array>} Matching socles
   */
  async searchByInventoryNumber(inventoryNumber) {
    const db = await initDB()
    const index = db.transaction(STORES.SOCLES).store.index('inventoryNumber')
    return index.getAll(inventoryNumber)
  }
}

/**
 * User operations
 */
export const usersDB = {
  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User object
   */
  async getByEmail(email) {
    const db = await initDB()
    return db.get(STORES.USERS, email)
  },
  
  /**
   * Create or update user
   * @param {Object} user - User data
   * @returns {Promise<string>} User email
   */
  async save(user) {
    const db = await initDB()
    return db.put(STORES.USERS, user)
  },
  
  /**
   * Authenticate user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<boolean>} Authentication result
   */
  async authenticate(email, password) {
    const user = await this.getByEmail(email)
    return user && user.password === password
  }
}

/**
 * Settings operations
 */
export const settingsDB = {
  /**
   * Get setting by key
   * @param {string} key - Setting key
   * @returns {Promise<*>} Setting value
   */
  async get(key) {
    const db = await initDB()
    const setting = await db.get(STORES.SETTINGS, key)
    return setting ? setting.value : null
  },
  
  /**
   * Set setting value
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   * @returns {Promise<string>} Setting key
   */
  async set(key, value) {
    const db = await initDB()
    return db.put(STORES.SETTINGS, { key, value })
  }
}

/**
 * Initialize default demo data
 */
export async function initDemoData() {
  const socles = await soclesDB.getAll()
  
  // Only add demo data if database is empty
  if (socles.length === 0) {
    // Create demo user
    await usersDB.save({
      email: 'demo@socles.fr',
      password: 'demo',
      name: 'Utilisateur démo'
    })
    
    // Create demo socles
    await soclesDB.create({
      inventoryNumber: 'INV-2024-001',
      typography: 'Socle cylindrique',
      heightCm: 120,
      lengthCm: 40,
      widthCm: 40,
      expositionNumber: 'EXP-2024-01',
      function: 'Support pour sculpture',
      instructions: 'Fixer la sculpture avec les points d\'attache prévus',
      materials: 'Bois peint blanc',
      location: 'Réserve A3',
      crate: 'CAISSE-01',
      exposition: 'Art Contemporain 2024',
      reserved: false,
      antiSeismic: true,
      doNotAdapt: false,
      showcase: true,
      comments: 'Socle en excellent état',
      isDraft: false
    })
    
    await soclesDB.create({
      inventoryNumber: 'INV-2024-002',
      typography: 'Socle rectangulaire',
      heightCm: 80,
      lengthCm: 60,
      widthCm: 50,
      expositionNumber: 'EXP-2024-02',
      function: 'Support pour céramique',
      instructions: '',
      materials: 'Métal noir mat',
      location: 'Salle 12',
      crate: '',
      exposition: '',
      reserved: true,
      antiSeismic: false,
      doNotAdapt: false,
      showcase: false,
      comments: '',
      isDraft: true
    })
  }
}
