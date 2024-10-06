import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Modal, StyleSheet, Platform } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';

interface ModalQuizFormProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onUploadQuiz: (title: string, description: string, fileContent: string, fileName: string) => void;
}

export default function ModalQuizForm({
  modalVisible,
  setModalVisible,
  onUploadQuiz,
}: ModalQuizFormProps) {
  const [newQuizTitle, setNewQuizTitle] = useState<string>('');
  const [newQuizDescription, setNewQuizDescription] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const handleFileSelection = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        setSelectedFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setFileContent(content.split(',')[1]);
        };
        reader.readAsDataURL(file);
      };
      input.click();
    } else {
      alert('File selection not implemented for mobile platforms yet');
    }
  };

  const handleUploadQuiz = () => {
    if (newQuizTitle && newQuizDescription && fileContent && selectedFileName) {
      onUploadQuiz(newQuizTitle, newQuizDescription, fileContent, selectedFileName);
      setNewQuizTitle('');
      setNewQuizDescription('');
      setSelectedFileName(null);
      setFileContent(null);
      setModalVisible(false);
    } else {
      alert("Please fill all fields and select a file.");
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <ThemedText style={styles.modalTitle}>Create New Quiz</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Quiz Title"
            value={newQuizTitle}
            onChangeText={setNewQuizTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Quiz Description"
            value={newQuizDescription}
            onChangeText={setNewQuizDescription}
            multiline
          />
          <TouchableOpacity style={styles.fileButton} onPress={handleFileSelection}>
            <Ionicons name="document-attach" size={24} color="#007AFF" />
            <ThemedText style={styles.fileButtonText}>
              {selectedFileName ? selectedFileName : "Select CSV File"}
            </ThemedText>
          </TouchableOpacity>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.uploadButton]} onPress={handleUploadQuiz}>
              <AntDesign name="upload" size={24} color="white" />
              <ThemedText style={styles.buttonText}>Upload Quiz</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <MaterialIcons name="cancel" size={24} color="white" />
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '100%',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  fileButtonText: {
    marginLeft: 10,
    color: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    width: '48%',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
  },
});