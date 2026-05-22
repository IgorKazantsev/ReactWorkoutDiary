// @ts-nocheck

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const STORAGE_KEY = "workout_diary_data_v2";

export default function Index() {
  const [screen, setScreen] = useState("home");
  const [exercises, setExercises] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [name, setName] = useState("");
  const [setCount, setSetCount] = useState("4");

  const [reps, setReps] = useState([]);
  const [kgs, setKgs] = useState([]);

  const selectedExercise = exercises.find((e) => e.id === selectedId);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        setExercises(JSON.parse(saved));
      }
    } catch (error) {
      Alert.alert("Error", "Could not load data");
    }
  }

  async function updateExercises(newExercises) {
    setExercises(newExercises);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newExercises));
  }

  function addExercise() {
    if (!name.trim()) {
      Alert.alert("Error", "Enter exercise name");
      return;
    }

    let count = parseInt(setCount, 10);

    if (isNaN(count)) count = 1;
    if (count < 1) count = 1;
    if (count > 4) count = 4;

    const newExercise = {
      id: Date.now().toString(),
      name: name.trim(),
      setCount: count,
      workouts: [],
    };

    updateExercises([...exercises, newExercise]);

    setName("");
    setSetCount("4");
    setScreen("home");
  }

  function deleteExercise(id) {
    Alert.alert("Delete exercise", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          updateExercises(exercises.filter((e) => e.id !== id));
        },
      },
    ]);
  }

  function openExercise(exercise) {
    setSelectedId(exercise.id);
    setReps(Array(exercise.setCount).fill(""));
    setKgs(Array(exercise.setCount).fill(""));
    setScreen("detail");
  }

  function saveWorkout() {
    if (!selectedExercise) return;

    const sets = [];

    for (let i = 0; i < selectedExercise.setCount; i++) {
      if (reps[i] || kgs[i]) {
        sets.push({
          reps: reps[i] || "",
          kg: kgs[i] || "",
        });
      }
    }

    if (sets.length === 0) {
      Alert.alert("Error", "Enter at least one set");
      return;
    }

    const workout = {
      date: new Date().toLocaleString(),
      sets,
    };

    const updated = exercises.map((e) => {
      if (e.id === selectedExercise.id) {
        return {
          ...e,
          workouts: [workout, ...e.workouts],
        };
      }

      return e;
    });

    updateExercises(updated);
    setReps(Array(selectedExercise.setCount).fill(""));
    setKgs(Array(selectedExercise.setCount).fill(""));
  }

  if (screen === "add") {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Add Exercise</Text>

        <Text style={styles.label}>Exercise name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Bench Press"
        />

        <Text style={styles.label}>Sets count 1-4</Text>
        <TextInput
          style={styles.input}
          value={setCount}
          onChangeText={setSetCount}
          placeholder="4"
          keyboardType="number-pad"
        />

        <TouchableOpacity style={styles.mainButton} onPress={addExercise}>
          <Text style={styles.mainButtonText}>Save Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setScreen("home")}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (screen === "detail" && selectedExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Text style={styles.title}>{selectedExercise.name}</Text>
          <Text style={styles.subtitle}>
            Today: {new Date().toLocaleDateString()}
          </Text>

          <Text style={styles.sectionTitle}>New workout</Text>

          <View style={styles.row}>
            {Array.from({ length: selectedExercise.setCount }).map(
              (_, index) => (
                <View key={index} style={styles.setBox}>
                  <TextInput
                    style={styles.cell}
                    value={reps[index]}
                    onChangeText={(text) => {
                      const copy = [...reps];
                      copy[index] = text;
                      setReps(copy);
                    }}
                    placeholder="reps"
                    keyboardType="number-pad"
                  />

                  <TextInput
                    style={styles.cell}
                    value={kgs[index]}
                    onChangeText={(text) => {
                      const copy = [...kgs];
                      copy[index] = text;
                      setKgs(copy);
                    }}
                    placeholder="kg"
                    keyboardType="number-pad"
                  />
                </View>
              ),
            )}
          </View>

          <TouchableOpacity style={styles.mainButton} onPress={saveWorkout}>
            <Text style={styles.mainButtonText}>Save Workout</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>History</Text>

          {selectedExercise.workouts.length === 0 ? (
            <Text style={styles.empty}>No workouts yet</Text>
          ) : (
            selectedExercise.workouts.map((workout, index) => (
              <View key={index} style={styles.historyCard}>
                <Text style={styles.historyDate}>{workout.date}</Text>

                <View style={styles.row}>
                  {workout.sets.map((set, i) => (
                    <View key={i} style={styles.historyBox}>
                      <Text style={styles.historyText}>{set.reps}</Text>
                      <Text style={styles.historyText}>{set.kg} kg</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen("home")}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Workout Diary</Text>

      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => setScreen("add")}
      >
        <Text style={styles.mainButtonText}>+ Add Exercise</Text>
      </TouchableOpacity>

      <ScrollView style={{ marginTop: 16 }}>
        {exercises.length === 0 ? (
          <Text style={styles.empty}>No exercises yet</Text>
        ) : (
          exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => openExercise(exercise)}
              >
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.subtitle}>
                  {exercise.setCount} sets • {exercise.workouts.length} workouts
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteExercise(exercise.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    color: "#666",
    marginTop: 4,
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
  },
  mainButton: {
    backgroundColor: "#222",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
  },
  mainButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    borderWidth: 1,
    borderColor: "#222",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
  },
  backButtonText: {
    fontWeight: "bold",
  },
  exerciseCard: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#ffe0e0",
    padding: 10,
    borderRadius: 8,
  },
  deleteText: {
    color: "#b00020",
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    color: "#777",
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 22,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
  },
  setBox: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#111",
    marginHorizontal: 4,
    backgroundColor: "white",
  },
  cell: {
    textAlign: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#111",
    fontWeight: "bold",
  },
  historyCard: {
    backgroundColor: "#e9e9e9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  historyDate: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  historyBox: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#111",
    marginHorizontal: 4,
    backgroundColor: "white",
    alignItems: "center",
    padding: 10,
  },
  historyText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
