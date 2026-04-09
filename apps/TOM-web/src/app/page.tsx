type Todo = {
  id: number;
  name: string;
};

type TodosResponse = {
  todos?: Todo[];
  error?: string;
};

export const dynamic = 'force-dynamic';

async function getTodos(): Promise<Todo[]> {
  const tomApiUrl = process.env.TOM_API_URL ?? 'http://localhost:3333';
  const response = await fetch(`${tomApiUrl}/api/todos`, { cache: 'no-store' });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as TodosResponse;
  return payload.todos ?? [];
}

export default async function Page() {
  const todos = await getTodos();

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  );
}
