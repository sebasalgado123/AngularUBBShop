export const environment = {
    production: false,
    // Priorizar Railway, fallback a local
    apiUrl: 'https://tu-app-railway.up.railway.app/api',
    // URL de fallback local
    localApiUrl: 'http://localhost:3000/api',
    // Función para obtener la URL correcta
    getApiUrl: function() {
        // En desarrollo, intentar Railway primero, luego local
        return this.apiUrl;
    }
}; 