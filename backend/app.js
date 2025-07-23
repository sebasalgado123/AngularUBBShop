//requires
var express = require('express');
const mysql = require('mysql');

const bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const mc = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'',
    database:'proyectoangular'
});

mc.connect();

/*app.post('/proyectoangular/producto', function(req,res){

    let datosProducto ={
        //id_producto
        titulo:req.body.titulo,
        descripcion:req.body.descripcion,
        precio:parseInt(req.body.precio),
        contacto:req.body.contacto,
        disponibilidad:req.body.disponibilidad,
        fecha_creacion:req.body.fecha_creacion,
        fecha_modificacion:req.body.fecha_modificacion,
        imageUrl:req.body.imageUrl,
        categoria:req.body.categoria
    }
    if(mc){
        mc.query("INSERT INTO products SET ?", datosProducto, function(error,results){
            if(error){
                res.status(500).json({"Mensaje":"Error"});
            }else{
                res.status(201).json({"Mensaje":"Insertado"});
            }    
        });
    }
});


*/

app.get('/proyectoangular/producto', function(req,res){
    mc.query('SELECT * FROM producto', function(error, results,fields){
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