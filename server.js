const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const port = 3001;

const plantasPath = path.join(__dirname, 'plantas.json');
const plantasData = fs.readFileSync(plantasPath, 'utf-8');
const plantas = JSON.parse(plantasData);
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));

function buscarNome(nome){
    return plantas.find (planta => planta.nome_popular === nome);
}

function buscarPropriedade(propriedade){
    return plantas.find (planta => planta.propriedade === propriedade);
}

function criarCard(planta) {
    return `
        <div class="card">
                <img src="${planta.url_imagem}" class="card-img-top w-200 h-200" alt="${planta.nome_popular}">
            <div class="card-body">
                <h5 class="card-title">${planta.nome_popular}</h5>
                <ul>
                    <li>${planta.caracteristicas_gerais}</li><br>
                    <li>${planta.propriedade}</li>
                </ul>
            </div>
        </div><br>     
    `;
}

app.get('', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/voltar', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/voltarAdicionar', (req, res) => {
    res.sendFile(path.join(__dirname, 'adicionar.html'));
});

app.get('/adicionar', (req, res) => {
    res.sendFile(path.join(__dirname, 'adicionar.html'));
});

app.post('/adicionar', (req, res) => {
    const novaPlanta = req.body;

    if (plantas.find(planta => planta.nome_popular.toLowerCase() === novaPlanta.nome_popular.toLowerCase())) {
        res.send(`
            <div class="container">
                <h2>Planta já existe. Não é possível adiciona duplicatas.</h2>
                <div>
                    <a href="/voltarAdicionar">
                        <button type="button" class="btn btn-danger">VOLTAR</button>
                    </a>
                </div>
            </div>
        `);
        return;
    }

    plantas.push(novaPlanta);

    salvarDados(plantas);

    res.send(`
            <div class="container">
                <h2>Planta adicionada com sucesso!</h2>
                <div>
                    <a href="/voltar">
                        <button type="button" class="btn btn-sucess">VOLTAR</button>
                    </a>
                </div>
            </div>
    `);
});

app.get('/verificar', (req, res) => {
    const cardsHtml = plantas.map(planta => criarCard(planta)).join('');
    const pagehtmlPath = path.join(__dirname, 'dados.html');
    let pageHtml = fs.readFileSync(pagehtmlPath, 'utf-8');
    pageHtml = pageHtml.replace('{{cardsHtml}}', cardsHtml);
    res.send(pageHtml);
});

app.get('/filtrarTela', (req, res) => {
    res.sendFile(path.join(__dirname, 'filtrarTela.html'));
});

app.get('/filtrarNome', (req, res) => {
    res.sendFile(path.join(__dirname, 'filtrar.html'));
});

app.get('/filtrarNome/:nome', (req, res) => {
    const nome = req.query.nome_popular;
    const nomeFiltrado = plantas.filter(planta => planta.nome_popular === nome);
    const nomeEncontrado = buscarNome(nome);

    let card = '';

    if (nomeEncontrado){
        nomeFiltrado.forEach(planta => {

            card += `
                <div class="card">
                        <img src="${planta.url_imagem}" class="card-img-top" style="max-width: 360px; justify-content:center;" alt="${planta.nome_popular}">
                    <div class="card-body">
                        <h5 class="card-title">${planta.nome_popular}</h5>
                        <p class="card-text">${planta.caracteristicas_gerais}</p>
                        <a href="/voltar" class="btn btn-success">Voltar</a>
                    </div>
                </div>   
            `;
        });
        
        const htmlContent = fs.readFileSync('dadosNome.html', 'utf-8');
        const finalHtml = htmlContent.replace('{{card}}', card);

        res.send(finalHtml);

    } else{
        res.send(`
            <div class="container">
                <h2>Planta não encontrada!</h2>
                <div>
                    <a href="/filtrarNome">
                        <button type="button" class="btn btn-sucess">VOLTAR</button>
                    </a>
                </div>
            </div>
    `);
    }
});

app.get('/filtrarPropriedade', (req, res) => {
    res.sendFile(path.join(__dirname, 'filtrarPropriedade.html'));
});

app.get('/filtrarPropriedade/:propriedade', (req, res) => {
    const propriedade = req.query.propriedade;
    const propriedadeFiltrado = plantas.filter(planta => planta.propriedade === propriedade);
    const propriedadeEncontrado = buscarPropriedade(propriedade);

    let cardPropriedade = '';

    if (propriedadeEncontrado){
        propriedadeFiltrado.forEach(planta => {

            cardPropriedade += `
                <div class="card">
                        <img src="${planta.url_imagem}" class="card-img-top w-200 h-200" alt="${planta.nome_popular}">
                    <div class="card-body">
                        <h5 class="card-title">${planta.propriedade}</h5>
                        <ul>
                            <li>${planta.nome_popular}</li>
                            <li>${planta.caracteristicas_gerais}</li><br>
                        </ul>
                        <a href="/voltar" class="btn btn-success">Voltar</a>
                    </div>
                </div><br>     
            `;
        });
        
        const htmlContent = fs.readFileSync('dadosPropriedade.html', 'utf-8');
        const finalHtml = htmlContent.replace('{{cardPropriedade}}', cardPropriedade);

        res.send(finalHtml);

    } else{
        res.send(`
            <div class="container">
                <h2>Planta com esta propriedade não encontrada!</h2>
                <div>
                    <a href="/filtrarPropriedade">
                        <button type="button" class="btn btn-sucess">VOLTAR</button>
                    </a>
                </div>
            </div>
    `);
    }
});

app.get('/editar', (req, res) => {
    res.sendFile(path.join(__dirname, 'editar.html'));
});

app.post('/editar', (req, res) => {
    const { nome_popular, novaPropriedade, novaCaracteristica } = req.body;

    let plantasData = fs.readFileSync(plantasPath, 'utf-8');
    let plantas = JSON.parse(plantasData);

    const plantaIndex = plantas.findIndex(planta => planta.nome_popular === nome_popular);

    if (plantaIndex === -1){
        res.send(`
            <div class="container">
                <h2>Planta não encontrada!</h2>
                <div>
                    <a href="/editar">
                        <button type="button" class="btn btn-sucess">VOLTAR</button>
                    </a>
                </div>
            </div>
        `);
        return;
    }

    plantas[plantaIndex].propriedade = novaPropriedade;
    plantas[plantaIndex].caracteristicas_gerais = novaCaracteristica;

    res.send(`
            <div class="container">
                <h2>Dados da planta atualizados com sucesso!</h2>
                <div>
                    <a href="/voltar">
                        <button type="button" class="btn btn-sucess">VOLTAR</button>
                    </a>
                </div>
            </div>
    `);

    salvarDados(plantas);
});

app.get('/excluir', (req, res) => {
    res.sendFile(path.join(__dirname, 'excluir.html'));
});

app.post('/excluir', (req, res) => {
    const { nome_popular } = req.body;

    let plantasData = fs.readFileSync(plantasPath, 'utf-8');
    let plantas = JSON.parse(plantasData);

    const plantaIndex = plantas.findIndex(planta => planta.nome_popular === nome_popular);

    if (plantaIndex === -1) {
        res.send(`
            <div class="container">
                <h2>Planta não encontrada!</h2>
                <div>
                    <a href="/excluir">
                        <button type="button" class="btn btn-sucess">VOLTAR</button>
                    </a>
                </div>
            </div>
    `);
        return;
    }

    res.send(`
    <script>
        if (confirm('Tem certeza de que deseja excluir a planta ${nome_popular}?')){
            window.location.href = '/excluir-planta?nome=${nome_popular}';
        } else{
            window.location.href = '/excluir';
        }
    </script>
    `);

});

app.get('/excluir-planta', (req, res) => {
    const nome_popular = req.query.nome_popular;

    let plantasData = fs.readFileSync(plantasPath, 'utf-8');
    let plantas = JSON.parse(plantasData);

    const plantaIndex = plantas.findIndex(planta => planta.nome_popular === nome_popular);

    plantas.splice(plantaIndex, 1);


    res.send(`<div class="container">
                <h2>A Planta foi excluída com sucesso!</h2>
                <div>
                    <a href="/voltar">
                        <button type="button" class="btn btn-sucess">VOLTAR</button>
                    </a>
                </div>
    </div>`);
    
    salvarDados(plantas);
});

function salvarDados(plantas) {
    fs.writeFileSync(plantasPath, JSON.stringify(plantas, null, 2));
}

app.listen(port, () => {
    console.log(`Servidor iniciado em http://localhost:${port}`);
});