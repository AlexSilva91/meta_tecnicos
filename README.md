
# Meta Tecnicos

<p align="justify">
O presente projeto visa realizar a coleta de informações de serviços realizados por técnicos de telecom, calcular e apresentar esses dados de forma a facilitar decisões estratégicas. Com base nos dados coletados será possível discernir sobre possíveis melhorias no que concerne a treinamentos da equipe.
</p>

## Estrutura

```
meta_tecnicos
├─ app
│  ├─ __init__.py
│  ├─ database
│  │  ├─ __init__.py
│  │  └─ connection.py
│  ├─ models
│  │  ├─ __init__.py
│  │  ├─ model_expert.py
│  │  └─ service_order.py
│  ├─ routes
│  │  └─ __init__.py
│  ├─ service
│  │  └─ __init__.py
│  ├─ static
│  ├─ templates
│  └─ utils
│     └─ __init__.py
└venv

```

## 🧰 Tecnologias Utilizadas

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" height="50" alt="Python"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg" height="50" alt="Flask"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" height="50" alt="PostgreSQL"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" height="50" alt="HTML5"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" height="50" alt="CSS3"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" height="50" alt="JavaScript"/>
</p>

## Usado por

Esse projeto é usado pelas seguintes empresas:

- Ourinet Telecom [https://www.ourinet.com.br]

## Rodando localmente

Clone o projeto

```bash
  git clone git@github.com:AlexSilva91/meta_tecnicos.git
```

Entre no diretório do projeto

```bash
  cd meta_tecnicos
```

Criar e Ativar ambiente virtual

```bash
  python -m venv .venv
  source .venv/bin/activate
```

Instale as dependências

```bash
  pip install -r requirements.txt
```

Inicie o servidor

```bash
  python run.py
```

## Aprendizados

O que você aprendeu construindo esse projeto? Quais desafios você enfrentou e como você superou-os?

Durante o desenvolvimento deste projeto, aprendi a **integrar e organizar dados provenientes de múltiplas fontes externas**, especialmente APIs de diferentes serviços de telecom.  

Esse processo me proporcionou maior compreensão sobre **como estruturar fluxos de dados, validar informações recebidas e consolidá-las para análise estratégica**.  

Também aprofundei meus conhecimentos em **Python, Flask e SQLAlchemy**, aplicando-os de forma prática para criar um sistema funcional de **coleta e apresentação de dados**.

## Autores

- [Alex da Silva Alves](https://github.com/AlexSilva91)

## Suporte

Para suporte ou mais informações, mande um email para <alexalves9164@gmail.com>.
