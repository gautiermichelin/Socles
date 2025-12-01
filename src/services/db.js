import { openDB } from 'idb'

const DB_NAME = 'SoclesDB'
const DB_VERSION = 2

// Store names
const STORES = {
  SOCLES: 'socles',
  EXPOSITIONS: 'expositions',
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

      // Create expositions store
      if (!db.objectStoreNames.contains(STORES.EXPOSITIONS)) {
        const expositionsStore = db.createObjectStore(STORES.EXPOSITIONS, {
          keyPath: 'id',
          autoIncrement: true
        })
        expositionsStore.createIndex('shortTitle', 'shortTitle', { unique: false })
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
   * @returns {Promise<Object>} Created socle object with ID
   */
  async create(socle) {
    const db = await initDB()
    const newSocle = {
      ...socle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const id = await db.add(STORES.SOCLES, newSocle)
    return { ...newSocle, id }
  },
  
  /**
   * Update an existing socle
   * @param {Object} socle - Socle data with id
   * @returns {Promise<Object>} Updated socle object
   */
  async update(socle) {
    const db = await initDB()
    const updatedSocle = {
      ...socle,
      updatedAt: new Date().toISOString()
    }
    await db.put(STORES.SOCLES, updatedSocle)
    return updatedSocle
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
 * Exposition operations
 */
export const expositionsDB = {
  /**
   * Get all expositions
   * @returns {Promise<Array>} Array of all expositions
   */
  async getAll() {
    const db = await initDB()
    return db.getAll(STORES.EXPOSITIONS)
  },

  /**
   * Get an exposition by ID
   * @param {number} id - Exposition ID
   * @returns {Promise<Object>} Exposition object
   */
  async getById(id) {
    const db = await initDB()
    return db.get(STORES.EXPOSITIONS, id)
  },

  /**
   * Create a new exposition
   * @param {Object} exposition - Exposition data
   * @returns {Promise<Object>} Created exposition object with ID
   */
  async create(exposition) {
    const db = await initDB()
    const newExposition = {
      ...exposition,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const id = await db.add(STORES.EXPOSITIONS, newExposition)
    return { ...newExposition, id }
  },

  /**
   * Update an existing exposition
   * @param {Object} exposition - Exposition data with id
   * @returns {Promise<Object>} Updated exposition object
   */
  async update(exposition) {
    const db = await initDB()
    const updatedExposition = {
      ...exposition,
      updatedAt: new Date().toISOString()
    }
    await db.put(STORES.EXPOSITIONS, updatedExposition)
    return updatedExposition
  },

  /**
   * Delete an exposition
   * @param {number} id - Exposition ID to delete
   * @returns {Promise<void>}
   */
  async delete(id) {
    const db = await initDB()
    return db.delete(STORES.EXPOSITIONS, id)
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
 * Convert image URL to base64
 */
async function imageUrlToBase64(url) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error converting image to base64:', error)
    return null
  }
}

/**
 * Initialize default demo data
 */
export async function initDemoData() {
  const socles = await soclesDB.getAll()
  const expositions = await expositionsDB.getAll()

  // Create demo expositions if none exist
  if (expositions.length === 0) {
    // Convert images to base64
    const expo1Image = await imageUrlToBase64('/images/expo1.jpg')
    const expo2Image = await imageUrlToBase64('/images/expo2.jpg')
    const expo3Image = await imageUrlToBase64('/images/expo3.jpg')
    const expo4Image = await imageUrlToBase64('/images/expo4.jpg')

    await expositionsDB.create({
      shortTitle: 'Mexica',
      longTitle: 'Mexica',
      startDate: '2024-04-03',
      endDate: '2024-09-08',
      location: 'Musée du Quai Branly',
      imageUrl: expo1Image,
      color: '#103074'
    })

    await expositionsDB.create({
      shortTitle: 'Zombis',
      longTitle: 'Zombis',
      startDate: '2024-10-08',
      endDate: '2025-02-16',
      location: 'Musée du Quai Branly',
      imageUrl: expo2Image,
      color: '#96282e'
    })

    await expositionsDB.create({
      shortTitle: 'Kimono',
      longTitle: 'Kimono',
      startDate: '2022-11-22',
      endDate: '2023-05-28',
      location: 'Musée du Quai Branly',
      imageUrl: expo3Image,
      color: '#ffffff'
    })

    await expositionsDB.create({
      shortTitle: 'Wampum',
      longTitle: 'Wampum',
      startDate: '2022-02-08',
      endDate: '2022-05-15',
      location: 'Musée du Quai Branly',
      imageUrl: expo4Image,
      color: '#7c4d5c'
    })
  }

  // Only add demo socles if database is empty
  if (socles.length === 0) {
    // Create demo user
    await usersDB.save({
      email: 'socles@quaibranly.fr',
      password: 'socles',
      name: 'Utilisateur démo socles'
    })

    // Real socles data from Excel file
    const soclesData = [
      {
        inventoryNumber: '71.1878.32.56',
        typography: 'Morpho piqué fond',
        heightCm: 62,
        lengthCm: 32,
        widthCm: 8.5,
        expositionNumber: '1',
        function: 'Expo - temporaire',
        instructions: 'Morphologic mount to insert on the background',
        materials: 'Acier peint noir mat',
        location: 'Entrepôt exterieur Translyne',
        crate: 'BKI-0001',
        exposition: 'Wampum',
        reserved: false,
        antiSeismic: false,
        doNotAdapt: false,
        showcase: true
      },
      {
        inventoryNumber: '71.1934.33.36 D',
        typography: 'Morpho sur platine',
        heightCm: 9,
        lengthCm: 13,
        widthCm: null,
        expositionNumber: '3',
        function: 'Expo - temporaire',
        instructions: 'Morphologic mount free-standing.',
        materials: 'Acier peint noir mat',
        location: 'Entrepôt exterieur Translyne',
        crate: 'BKI-0001',
        exposition: 'Wampum',
        reserved: false,
        antiSeismic: false,
        doNotAdapt: false,
        showcase: true
      },
      {
        inventoryNumber: '71.1878.32.58',
        typography: 'Morpho piqué fond',
        heightCm: 60,
        lengthCm: 32,
        widthCm: 8,
        expositionNumber: '4',
        function: 'Expo - temporaire',
        instructions: 'Morphologic mount to insert on the background',
        materials: 'Acier peint noir mat',
        location: 'Entrepôt exterieur Translyne',
        crate: 'BKI-0001',
        exposition: 'Wampum',
        reserved: false,
        antiSeismic: false,
        doNotAdapt: false,
        showcase: true
      },
      {
        inventoryNumber: '71.1878.32.60',
        typography: 'Morpho piqué fond',
        heightCm: 60,
        lengthCm: 40,
        widthCm: 7,
        expositionNumber: '5',
        function: 'Expo - temporaire',
        instructions: 'Morphologic mount to insert on the background',
        materials: 'Acier peint noir mat',
        location: 'Entrepôt exterieur Translyne',
        crate: 'BKI-0001',
        exposition: 'Wampum',
        reserved: false,
        antiSeismic: false,
        doNotAdapt: false,
        showcase: true
      },
      {
        inventoryNumber: '71.1934.33.51 D',
        typography: 'Morpho sur platine',
        heightCm: 19,
        lengthCm: 19,
        widthCm: null,
        expositionNumber: '6',
        function: 'Expo - temporaire',
        instructions: 'Morphologic mount free-standing',
        materials: 'Acier peint noir mat',
        location: 'Entrepôt exterieur Translyne',
        crate: 'BKI-0001',
        exposition: 'Wampum',
        reserved: false,
        antiSeismic: false,
        doNotAdapt: false,
        showcase: true
      },
      {
        inventoryNumber: '71.1909.19.61.1-2 Am D',
        typography: 'Morpho sur platine',
        heightCm: 10,
        lengthCm: 12,
        widthCm: null,
        expositionNumber: '7',
        function: 'Expo - temporaire',
        instructions: 'Morphologic mount free-standing',
        materials: 'Acier peint noir mat',
        location: 'Entrepôt exterieur Translyne',
        crate: 'BKI-0001',
        exposition: 'Wampum',
        reserved: false,
        antiSeismic: false,
        doNotAdapt: false,
        showcase: true
      },
      {
        inventoryNumber: '71.1878.32.163',
        typography: 'Morpho piqué fond',
        heightCm: 60,
        lengthCm: 35,
        widthCm: 8,
        expositionNumber: '8',
        function: 'Expo - temporaire',
        instructions: 'Morphologic mount to insert on the background',
        materials: 'Acier peint noir mat',
        location: 'Entrepôt exterieur Translyne',
        crate: 'BKI-0001',
        exposition: 'Wampum',
        reserved: false,
        antiSeismic: false,
        doNotAdapt: false,
        showcase: true
      },
      {
        inventoryNumber: '71.1917.3.14 D',
        typography: 'Morpho sur platine',
        heightCm: 9,
        lengthCm: 11,
        widthCm: null,
        expositionNumber: '9',
        function: 'Expo - temporaire',
        instructions: 'Morphologic mount free-standing',
        materials: 'Acier peint noir mat',
        location: 'Entrepôt exterieur Translyne',
        crate: 'BKI-0001',
        exposition: 'Wampum',
        reserved: false,
        antiSeismic: false,
        doNotAdapt: false,
        showcase: true
      },
      {
        inventoryNumber: '71.1881.17.1',
        typography: 'Morpho sur platine',
        heightCm: 7,
        lengthCm: 10,
        widthCm: null,
        expositionNumber: '10',
        function: 'Expo - temporaire',
        instructions: 'Morphologic mount free-standing',
        materials: 'Acier peint noir mat',
        location: 'Entrepôt exterieur Translyne',
        crate: 'BKI-0001',
        exposition: 'Wampum',
        reserved: false,
        antiSeismic: false,
        doNotAdapt: false,
        showcase: true
      },
      {
        inventoryNumber: '71.1878.32.63',
        typography: 'Morpho piqué fond',
        heightCm: 60,
        lengthCm: 35,
        widthCm: 8,
        expositionNumber: '11',
        function: 'Expo - temporaire',
        instructions: 'Morphologic mount to insert on the background',
        materials: 'Acier peint noir mat',
        location: 'Entrepôt exterieur Translyne',
        crate: 'BKI-0001',
        exposition: 'Wampum',
        reserved: false,
        antiSeismic: false,
        doNotAdapt: false,
        showcase: true
      }
    ]

    // Create socles with images
    for (const socleData of soclesData) {
      const imageUrl = await imageUrlToBase64(`/images/${socleData.inventoryNumber}.jpg`)
      await soclesDB.create({
        ...socleData,
        imageUrl,
        comments: '',
        isDraft: false,
        photos: []
      })
    }
  }
}
