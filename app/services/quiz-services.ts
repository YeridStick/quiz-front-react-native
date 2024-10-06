import axios from "axios";
import { Quiz } from "../types/quiz";

const API_URL = "http://localhost:8020/api";

export const fetchQuizzes = async (): Promise<Quiz[]> => {
  try {
    const response = await axios.get<Quiz[]>(`${API_URL}/quizzes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }
};

export const uploadQuiz = async (
  creadorId: string,
  titulo: string,
  descripcion: string,
  fileContent: string,
  fileName: string
): Promise<void> => {
  try {
    const data = {
      creadorId,
      titulo,
      descripcion,
      fileContent,
      fileName,
    };

    const response = await axios.post(`${API_URL}/quizzes/upload`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Upload response:", response.data);
  } catch (error) {
    console.error("Error uploading quiz:", error);
    throw error;
  }
};
