// Servicio de Firebase - Centraliza la conexión y operaciones
import { initializeApp } from "firebase-app";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut 
} from "firebase-auth";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    setDoc,
    serverTimestamp
} from "firebase-firestore";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDZhB90XoCIYZQEYR3eliuQECjpgHRaVew",
    authDomain: "nutrihabit-6e815.firebaseapp.com",
    projectId: "nutrihabit-6e815",
    storageBucket: "nutrihabit-6e815.firebasestorage.app",
    messagingSenderId: "597969987581",
    appId: "1:597969987581:web:b48fc389e9c48c0cb0db94",
    measurementId: "G-SDQE6HL306"
};

// Inicializar Firebase - UNA SOLA VEZ
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// EXPORTAR INSTANCIAS
// ============================================

export { app, auth, db };

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

export const ServicioAuth = {
    onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
    login: async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password);
    },
    register: async (email, password) => {
        return await createUserWithEmailAndPassword(auth, email, password);
    },
    logout: async () => {
        return await signOut(auth);
    },
    getCurrentUser: () => auth.currentUser
};

// ============================================
// FUNCIONES DE USUARIOS
// ============================================

export const ServicioUsuarios = {
    get: async (uid) => {
        const q = query(collection(db, "usuarios"), where("uid", "==", uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        }
        return null;
    },

    set: async (uid, data) => {
        const q = query(collection(db, "usuarios"), where("uid", "==", uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await updateDoc(doc(db, "usuarios", docId), data);
            return { id: docId, ...data };
        } else {
            await setDoc(doc(db, "usuarios", uid), { ...data, uid });
            return { id: uid, ...data };
        }
    },

    updateMeta: async (uid, metaDiaria) => {
        const q = query(collection(db, "usuarios"), where("uid", "==", uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await updateDoc(doc(db, "usuarios", docId), {
                metaDiaria: metaDiaria,
                fechaActualizacion: new Date().toISOString()
            });
            return true;
        }
        return false;
    },

    updateNotificaciones: async (uid, activas) => {
        const q = query(collection(db, "usuarios"), where("uid", "==", uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await updateDoc(doc(db, "usuarios", docId), {
                notificacionesActivas: activas,
                fechaActualizacion: new Date().toISOString()
            });
            return true;
        }
        return false;
    },

    actualizarPerfil: async (uid, nombre, correo) => {
        const q = query(collection(db, "usuarios"), where("uid", "==", uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await updateDoc(doc(db, "usuarios", docId), {
                nombre: nombre,
                correo: correo,
                fechaActualizacion: new Date().toISOString()
            });
            return true;
        }
        return false;
    }
};

// ============================================
// FUNCIONES DE REGISTROS DE AGUA
// ============================================

export const ServicioAgua = {
    getAll: async (uid) => {
        const q = query(collection(db, "registro_hidratacion"), where("idUsuario", "==", uid));
        const snapshot = await getDocs(q);
        const registros = [];
        snapshot.forEach(doc => {
            registros.push({ id: doc.id, ...doc.data() });
        });
        return registros;
    },

    getByFecha: async (uid, fecha) => {
        const q = query(
            collection(db, "registro_hidratacion"),
            where("idUsuario", "==", uid),
            where("fecha", "==", fecha)
        );
        const snapshot = await getDocs(q);
        let total = 0;
        snapshot.forEach(doc => {
            total += doc.data().cantidadML || 0;
        });
        return total;
    },

    create: async (uid, cantidadML, nota = '') => {
        const d = new Date();
        const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const registro = {
            idUsuario: uid,
            cantidadML: cantidadML,
            fecha: hoy,
            hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            fechaHora: new Date().toISOString(),
            nota: nota || ''
        };
        return await addDoc(collection(db, "registro_hidratacion"), registro);
    },

    update: async (id, cantidadML) => {
        await updateDoc(doc(db, "registro_hidratacion", id), {
            cantidadML: cantidadML,
            fechaHora: new Date().toISOString(),
            editado: true
        });
        return true;
    },

    delete: async (id) => {
        await deleteDoc(doc(db, "registro_hidratacion", id));
        return true;
    }
};

// ============================================
// FUNCIONES DE RECORDATORIOS - COMPLETAS
// ============================================

export const ServicioRecordatorios = {
    // Obtener todos los recordatorios de un usuario
    getAll: async (uid) => {
        console.log('🔥 Firebase: getAll para', uid);
        
        if (!uid) {
            console.error('❌ UID vacío');
            throw new Error('Usuario no autenticado');
        }
        
        try {
            // Consulta sin orderBy para evitar el índice compuesto
            const q = query(
                collection(db, 'recordatorios'),
                where('idUsuario', '==', uid)
            );
            
            const querySnapshot = await getDocs(q);
            console.log('📦 Documentos encontrados:', querySnapshot.size);
            
            const result = [];
            querySnapshot.forEach((doc) => {
                result.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Ordenar en memoria
            result.sort((a, b) => a.hora.localeCompare(b.hora));
            
            console.log(`✅ ${result.length} recordatorios obtenidos y ordenados`);
            return result;
        } catch (error) {
            console.error('❌ Error en Firebase getAll:', error);
            throw error;
        }
    },

    // Crear un nuevo recordatorio
    create: async (uid, hora, frecuencia = 'diario') => {
        console.log('🔥 Firebase: crear recordatorio', { uid, hora, frecuencia });
        
        if (!uid) {
            console.error('❌ UID vacío');
            throw new Error('Usuario no autenticado');
        }
        
        if (!hora) {
            console.error('❌ Hora vacía');
            throw new Error('La hora es requerida');
        }
        
        try {
            const docRef = await addDoc(collection(db, 'recordatorios'), {
                idUsuario: uid,
                hora: hora,
                frecuencia: frecuencia || 'diario',
                activo: true,
                fechaCreacion: serverTimestamp()
            });
            
            console.log('✅ Recordatorio creado con ID:', docRef.id);
            return docRef;
        } catch (error) {
            console.error('❌ Error en Firebase create:', error);
            throw error;
        }
    },

    // Eliminar un recordatorio
    delete: async (id) => {
        console.log('🔥 Firebase: eliminar recordatorio', id);
        
        if (!id) {
            console.error('❌ ID vacío');
            throw new Error('ID de recordatorio requerido');
        }
        
        try {
            await deleteDoc(doc(db, 'recordatorios', id));
            console.log('✅ Recordatorio eliminado');
            return true;
        } catch (error) {
            console.error('❌ Error en Firebase delete:', error);
            throw error;
        }
    },

    // Cambiar estado de un recordatorio
    toggleEstado: async (id, activo) => {
        console.log('🔥 Firebase: toggleEstado', { id, activo });
        
        if (!id) {
            console.error('❌ ID vacío');
            throw new Error('ID de recordatorio requerido');
        }
        
        try {
            await updateDoc(doc(db, 'recordatorios', id), {
                activo: activo
            });
            console.log('✅ Estado actualizado');
            return true;
        } catch (error) {
            console.error('❌ Error en Firebase toggleEstado:', error);
            throw error;
        }
    }
};

// ============================================
// VERIFICACIÓN DE EXPORTACIONES
// ============================================

console.log('✅ ServicioFirebase cargado correctamente');
console.log('📦 ServicioRecordatorios:', Object.keys(ServicioRecordatorios));
console.log('📦 ServicioAuth:', Object.keys(ServicioAuth));
console.log('📦 ServicioUsuarios:', Object.keys(ServicioUsuarios));
console.log('📦 ServicioAgua:', Object.keys(ServicioAgua));