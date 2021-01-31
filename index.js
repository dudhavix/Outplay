require('dotenv').config();
const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const handlebars = require('express-handlebars')
var i18next = require('i18next')
const textos = require('./texto')
var middleware = require('i18next-http-middleware')

i18next.use(middleware.LanguageDetector).init({
    preload: ['en', 'pt-br'],
})

app.use(
    middleware.handle(i18next, {
        ignoreRoutes: ['/foo'] // or function(req, res, options, i18next) { /* return true to ignore */ }
    })
)

//Body-Parser
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())

//View
app.engine('handlebars', handlebars({
    defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');
app.use(express.static('./views/public'));

//Rotas
app.get("/", (req, res) => {
    var lng = req.language
    if (lng == 'pt-BR') {
        res.render('App', {
            textos: textos.ptBr,
            idioma: 'pt-br'
        });
    } else {
        res.render('App', {
            textos: textos.en,
            idioma: 'en'
        });
    }
})

app.post("/enviarEmail", (req, res) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to: process.env.USUARIO_API_EMAIL,
        from: req.body.email,
        subject: 'Formulário do Site',
        text: 'Nome: ' + req.body.nome + ' Mensagem: ' + req.body.mensagem,
    }
    sgMail
        .send(msg)
        .then(() => {
            res.send('sucesso')
        })
        .catch((error) => {
            res.send('erro')
            console.error(error)
        })
})


app.listen(process.env.PORT || 3000, () => console.log("Escutando!"));