const fs = require('fs')

const DB_PATH = './core/db'

function create(content) {
    fs.writeFileSync(DB_PATH, content)
    return content
}

create('bananas e maçãs')
