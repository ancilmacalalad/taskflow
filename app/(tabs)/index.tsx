import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export default function HomeScreen() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editVisible, setEditVisible] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => { loadTasks(); }, []);

  async function loadTasks() {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) { Toast.show({ type: 'error', text1: 'Error', text2: error.message }); return; }
    setTasks(data || []);
  }

  async function addTask() {
    if (!task.trim()) { Toast.show({ type: 'error', text1: 'Oops!', text2: 'Please enter a task first.' }); return; }
    const { error } = await supabase.from('tasks').insert([{ title: task, completed: false }]);
    if (error) { Toast.show({ type: 'error', text1: 'Error', text2: error.message }); return; }
    setTask('');
    loadTasks();
    Toast.show({ type: 'success', text1: '✅ Task Added!', text2: 'Your task has been saved.' });
  }

  async function toggleTask(item: Task) {
    const { error } = await supabase.from('tasks').update({ completed: !item.completed }).eq('id', item.id);
    if (error) { Toast.show({ type: 'error', text1: 'Error', text2: error.message }); return; }
    loadTasks();
    Toast.show({ type: 'success', text1: item.completed ? '↩️ Marked Incomplete' : '✅ Marked Complete!', text2: `"${item.title}" updated.` });
  }

  async function deleteTask(id: string, title: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { Toast.show({ type: 'error', text1: 'Error', text2: error.message }); return; }
    loadTasks();
    Toast.show({ type: 'success', text1: '🗑️ Task Deleted!', text2: `"${title}" has been removed.` });
  }

  function handleEdit(item: Task) {
    setEditTask(item);
    setEditTitle(item.title);
    setEditVisible(true);
  }

  async function updateTask() {
    if (!editTitle.trim()) { Toast.show({ type: 'error', text1: 'Oops!', text2: 'Task title cannot be empty.' }); return; }
    if (!editTask) return;
    const { error } = await supabase.from('tasks').update({ title: editTitle }).eq('id', editTask.id);
    if (error) { Toast.show({ type: 'error', text1: 'Error', text2: error.message }); return; }
    setEditVisible(false);
    setEditTask(null);
    setEditTitle('');
    loadTasks();
    Toast.show({ type: 'success', text1: '✏️ Task Updated!', text2: 'Your task has been edited.' });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TaskFlow</Text>
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Enter Task" value={task} onChangeText={setTask} />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <MaterialIcons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {tasks.map((item) => (
        <View key={item.id} style={styles.taskRow}>
          <TouchableOpacity onPress={() => toggleTask(item)}>
            <MaterialIcons name={item.completed ? 'check-box' : 'check-box-outline-blank'} size={22} color={item.completed ? '#2E5BBA' : '#5A6472'} />
          </TouchableOpacity>
          <Text style={[styles.taskText, item.completed && styles.done]}>{item.title}</Text>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
            <MaterialIcons name="edit" size={20} color="#2E5BBA" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteTask(item.id, item.title)} style={styles.iconBtn}>
            <MaterialIcons name="delete" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      ))}

      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setEditVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>✏️ Edit Task</Text>
            <TextInput style={styles.modalInput} value={editTitle} onChangeText={setEditTitle} placeholder="Update task title" autoFocus />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={updateTask}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: 40, marginBottom: 10 },
  inputRow: { flexDirection: 'row', marginVertical: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginRight: 10 },
  addButton: { backgroundColor: '#2E5BBA', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  taskText: { flex: 1, marginLeft: 10, fontSize: 15 },
  done: { textDecorationLine: 'line-through', color: '#999' },
  iconBtn: { paddingHorizontal: 6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2A44' },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  cancelText: { color: '#5A6472', fontWeight: 'bold', paddingVertical: 10 },
  saveButton: { backgroundColor: '#2E5BBA', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', paddingVertical: 10 },
});
