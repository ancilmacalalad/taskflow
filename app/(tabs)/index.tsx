import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export default function HomeScreen() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return console.log(error.message);

    setTasks(data || []);
  }

  async function addTask() {
  if (!task.trim()) return;

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ title: task, completed: false }])
    .select();

console.log("DATA:", data);
console.log("ERROR:", error);
console.log("DELETE DATA:", data);
console.log("DELETE ERROR:", error);

  if (error) {
    alert(error.message);
    return;
  }

  setTask('');
  loadTasks();
}

  async function toggleTask(item: Task) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !item.completed })
      .eq('id', item.id);

    if (error) return console.log(error.message);

    loadTasks();
  }

async function deleteTask(id: string) {
  const { error, data } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  console.log("DELETE DATA:", data);
  console.log("DELETE ERROR:", error);

  if (error) return alert(error.message);

  loadTasks();
}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TaskFlow</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter Task"
          value={task}
          onChangeText={setTask}
        />

        <TouchableOpacity onPress={() => deleteTask(item.id)}>
  <MaterialIcons name="delete" size={18} color="#E74C3C" />
</TouchableOpacity>
      </View>

      {tasks.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => toggleTask(item)}
          onLongPress={() => deleteTask(item.id)}
          style={styles.taskRow}
        >
          <MaterialIcons
            name={item.completed ? 'check-box' : 'check-box-outline-blank'}
            size={20}
            color={item.completed ? '#2E5BBA' : '#5A6472'}
          />

          <Text style={[styles.taskText, item.completed && styles.done]}>
            {item.title}
          </Text>

          <MaterialIcons name="delete" size={18} color="#E74C3C" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: 40 },

  inputRow: { flexDirection: 'row', marginVertical: 20 },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },

  addButton: {
    backgroundColor: '#2E5BBA',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  taskText: { flex: 1, marginLeft: 10 },
  done: { textDecorationLine: 'line-through', color: '#999' },
});