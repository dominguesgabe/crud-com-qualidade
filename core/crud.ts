import fs from 'fs'
import { v4 as uuid } from 'uuid'

const DB_PATH = './core/db'

type UUID = string

interface Todo {
    date: string
    content: string
    done: boolean
    id: UUID
}

function create(content: string): Todo {
    const todo: Todo = {
        id: uuid(),
        date: new Date().toISOString(),
        content: content,
        done: false,
    }

    const todos: Todo[] = [
        ...read(),
        todo
    ]

    fs.writeFileSync(DB_PATH, JSON.stringify({todos}, null, 2))
    return todo
}

function read(): Todo[] {
    const stringDB = fs.readFileSync(DB_PATH, "utf-8")
    const dbData = JSON.parse(stringDB || '{}')

    if (!dbData.todos) {
        return []
    }

    return dbData.todos
}

function update(id: UUID, partialTodo: Partial<Todo>): Todo {
    let updatedTodo
    const todos: Todo[] = read()

    todos.forEach(todo => {
        if (todo.id === id) {
            updatedTodo = Object.assign(todo, partialTodo)
        }
    })

    fs.writeFileSync(DB_PATH, JSON.stringify(todos, null, 2))

    if (!updatedTodo) {
        throw new Error('please provide a valid ID')
    }

    return updatedTodo
}

function deleteById(id: UUID) {
    const todos: Todo[] = read()

    const filteredTodos: Todo[] = todos.filter(todo => id !== todo.id)

    fs.writeFileSync(DB_PATH, JSON.stringify(filteredTodos, null, 2)) 
}

function clearDB() {
    fs.writeFileSync(DB_PATH, "")
}

clearDB()
create('laranjas e limões')
const secondTodo = create('maçãs e maracujás')

update(secondTodo.id, { content: 'cupuaçú e abacaxis' })

deleteById(secondTodo.id)

read()