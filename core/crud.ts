import fs from 'fs'

const DB_PATH = './core/db'

interface Todo {
    date: string
    content: string
    done: boolean
}

function create(content: string) {
    const todo: Todo = {
        date: new Date().toISOString(),
        content: content,
        done: false,
    }

    const todos: Todo[] = [
        ...read(),
        todo
    ]

    fs.writeFileSync(DB_PATH, JSON.stringify({todos}, null, 2))
    return content
}

function read(): Todo[] {
    const stringDB = fs.readFileSync(DB_PATH, "utf-8")
    const dbData = JSON.parse(stringDB || '{}')

    if (!dbData.todos) {
        return []
    }

    return dbData.todos
}

function clearDB() {
    fs.writeFileSync(DB_PATH, "")
}

clearDB()
create('laranjas e limões')
create('maçãs e maracujás')

console.log(read())