import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { MealModal } from "../components/MealModal";
import { ActivityModal } from "../components/ActivityModal";
import { api } from "../services/api";
import "./Dashboard.css";

// Tipagem baseada na estrutura típica que o backend devolve
type Workout = {
  id: number;
  durationMinutes: number;
  performedAt: string;
  activity: {
    name: string;
  };
  location?: {
    name: string;
  };
};

// Tipagens baseadas no que vamos enviar/receber da API
type FoodItem = {
  id: number;
  quantityGrams: number;
  food: {
    id: number;
    name: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
  };
};

type Meal = {
  id: number;
  mealType: string;
  consumedAt: string;
  items: FoodItem[];
};

export function DashboardPaciente() {
  const { user, signOut } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Estados para gerir as refeições
  const [meals, setMeals] = useState<Meal[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

  // Busca as refeições sempre que a data selecionada mudar
  useEffect(() => {
    async function fetchDailyMeals() {
      setIsLoadingMeals(true);
      try {
        // Chamada à API enviando a data como query parameter
        const response = await api.get("/api/meals/daily", {
          params: { date: selectedDate },
        });
        setMeals(response.data);
      } catch (error) {
        console.error("Erro ao procurar refeições:", error);
        // Se a API ainda não tiver dados, garantimos que a lista fica vazia
        setMeals([]);
      } finally {
        setIsLoadingMeals(false);
      }
    }

    async function fetchDailyWorkouts() {
      setIsLoadingWorkouts(true);
      try {
        const response = await api.get("/api/activities/daily", {
          params: { date: selectedDate },
        });
        setWorkouts(response.data);
      } catch (error) {
        console.error("Erro ao procurar treinos:", error);
        setWorkouts([]);
      } finally {
        setIsLoadingWorkouts(false);
      }
    }

    fetchDailyMeals();
    fetchDailyWorkouts(); // Adicionamos a chamada aqui
  }, [selectedDate]);

  // Função auxiliar para traduzir o tipo de refeição
  const translateMealType = (type: string) => {
    const types: Record<string, string> = {
      BREAKFAST: "Pequeno-almoço",
      LUNCH: "Almoço",
      DINNER: "Jantar",
      SNACK: "Lanche",
    };
    return types[type] || type;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-logo">VitaTech</h1>
        <div className="header-user">
          <span className="user-greeting">Olá, {user?.name}</span>
          <button onClick={signOut} className="btn-logout">
            Sair
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="date-selector-container">
          <label htmlFor="date">Diário referente a:</label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="dashboard-grid">
          {/* Card: Diário Alimentar */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Alimentação</h2>
              <button
                className="btn-add"
                onClick={() => setIsMealModalOpen(true)}
              >
                + Refeição
              </button>
            </div>

            <div
              className="card-body"
              style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
            >
              {isLoadingMeals ? (
                <div className="empty-state">A carregar refeições...</div>
              ) : meals.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhuma refeição registada para este dia.</p>
                </div>
              ) : (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  {meals.map((meal) => (
                    <li
                      key={meal.id}
                      style={{
                        padding: "15px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                          fontWeight: "bold",
                        }}
                      >
                        <span>{translateMealType(meal.mealType)}</span>
                        {/* Exibe a hora da refeição */}
                        <span style={{ color: "#6b7280", fontSize: "14px" }}>
                          {new Date(meal.consumedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                          fontSize: "14px",
                          color: "#4b5563",
                        }}
                      >
                        {meal.items.map((item, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "4px 0",
                            }}
                          >
                            <span>{item.food.name}</span>
                            <span>{item.quantityGrams}g</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Card: Atividades Físicas */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Treinos</h2>
              <button
                className="btn-add"
                onClick={() => setIsActivityModalOpen(true)}
              >
                + Treino
              </button>
            </div>

            <div
              className="card-body"
              style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
            >
              {isLoadingWorkouts ? (
                <div className="empty-state">A carregar treinos...</div>
              ) : workouts.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhum treino registado para este dia.</p>
                </div>
              ) : (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  {workouts.map((workout) => (
                    <li
                      key={workout.id}
                      style={{
                        padding: "15px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                          fontWeight: "bold",
                        }}
                      >
                        {/* Como vimos nas refeições, o nome costuma vir aninhado no objeto "activity" */}
                        <span>{workout.activity?.name || "Treino"}</span>
                        <span style={{ color: "#6b7280", fontSize: "14px" }}>
                          {new Date(workout.performedAt).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#4b5563",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          Local: {workout.location?.name || "Não especificado"}
                        </span>
                        <span>{workout.durationMinutes} min</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Acompanhamento</h2>
            </div>
            <div className="empty-state">
              <p>Ainda não está vinculado a um nutricionista.</p>
              <button
                className="btn-add"
                style={{ width: "100%", padding: "12px" }}
              >
                Procurar Nutricionista
              </button>
            </div>
          </div>
        </div>
      </main>
      <MealModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        selectedDate={selectedDate}
        onSuccess={() => window.location.reload()}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        selectedDate={selectedDate}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
