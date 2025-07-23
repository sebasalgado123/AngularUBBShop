export const environment = {
    production: true,
    // En producción, usar Railway
    apiUrl: 'https://tu-app-railway.up.railway.app/api',
    // URL de fallback local (para casos de emergencia)
    localApiUrl: 'http://localhost:3000/api',
    // Función para obtener la URL correcta
    getApiUrl: function() {
        // En producción, siempre usar Railway
        return this.apiUrl;
    }
}; 