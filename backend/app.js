//requires
var express = require('express');
const bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// El resto del código de app.js puede quedarse igual, pero elimina la conexión directa a MySQL aquí.

app.get('/proyectoangular/producto', function(req,res){
    // Aquí deberías requerir el pool de db.js si quieres usarlo
    const pool = require('./db');
    pool.query('SELECT * FROM producto', function(error, results,fields){
        if(error)throw error;
        return res.send({
            error: false,
            data: results,
            message: 'lista de productos'
        });
    });
});

app.listen(3000,()=>{
    console.log('Express server - puerto 3000 online');
});

app.get('/',(req,res,next)=>{
    res.status(200).json({
        ok:true,
        mensaje:'Peticion realizada correctamente'
    })
});