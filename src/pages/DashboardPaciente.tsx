/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { api } from "../services/api";
import { MealModal } from "../components/MealModal";
import { ActivityModal } from "../components/ActivityModal";
import "./Dashboard.css";
import { ChatModal } from "../components/ChatModal";

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

type Workout = {
  id: number;
  durationMinutes: number;
  performedAt: string;
  activity: { name: string };
  location?: { name: string };
};

type NutritionistConnection = {
  id: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  nutritionist: { id: number; name: string };
};

type Nutritionist = {
  id: number;
  name: string;
};

export function DashboardPaciente() {
  const { user, signOut } = useContext(AuthContext);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const [connection, setConnection] = useState<NutritionistConnection | null>(
    null,
  );
  const [isLoadingConnection, setIsLoadingConnection] = useState(true);

  const [isRequesting, setIsRequesting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [searchNutriName, setSearchNutriName] = useState("");
  const [nutriResults, setNutriResults] = useState<Nutritionist[]>([]);
  const [isSearchingNutri, setIsSearchingNutri] = useState(false);
  const [selectedNutriId, setSelectedNutriId] = useState<number | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    async function fetchDailyMeals() {
      setIsLoadingMeals(true);
      try {
        const response = await api.get("/api/meals/daily", {
          params: { date: selectedDate },
        });
        setMeals(response.data);
      } catch (error) {
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
        setWorkouts([]);
      } finally {
        setIsLoadingWorkouts(false);
      }
    }

    fetchDailyMeals();
    fetchDailyWorkouts();
  }, [selectedDate]);

  useEffect(() => {
    async function fetchConnection() {
      setIsLoadingConnection(true);
      try {
        const response = await api.get("/api/connections/my-nutritionist");
        if (response.data && response.data.id) setConnection(response.data);
      } catch (error) {
        console.log("Sem vínculo atual.");
      } finally {
        setIsLoadingConnection(false);
      }
    }
    fetchConnection();
  }, []);

  useEffect(() => {
    if (searchNutriName.trim().length < 3) {
      setNutriResults([]);
      return;
    }

    if (selectedNutriId) return;

    setIsSearchingNutri(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await api.get("/api/nutritionists/search", {
          params: { name: searchNutriName, page: 0, size: 10 },
        });
        setNutriResults(response.data.content || response.data);
      } catch (error) {
        console.error("Erro ao pesquisar nutricionistas:", error);
        setNutriResults([]);
      } finally {
        setIsSearchingNutri(false);
      }
    }, 500); // 500ms de delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchNutriName, selectedNutriId]);

  async function handleRequestConnection() {
    if (!selectedNutriId) return;
    setIsRequesting(true);
    setConnectionMessage(null);

    try {
      await api.post(`/api/connections/request/${selectedNutriId}`);
      window.location.reload();
    } catch (error: any) {
      if (error.response && typeof error.response.data === "string") {
        setConnectionMessage({ text: error.response.data, type: "error" });
      } else {
        setConnectionMessage({ text: "Erro ao enviar pedido.", type: "error" });
      }
    } finally {
      setIsRequesting(false);
    }
  }

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
            <div
              className="card-body"
              style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {isLoadingConnection ? (
                <div className="empty-state">A verificar vínculo...</div>
              ) : connection?.status === "ACCEPTED" ? (
                <div className="empty-state" style={{ padding: "0" }}>
                  <div
                    style={{
                      backgroundColor: "#ecfdf5",
                      color: "#065f46",
                      padding: "8px 15px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      marginBottom: "15px",
                    }}
                  >
                    ✓ Acompanhamento Ativo
                  </div>
                  <p style={{ margin: "0 0 5px 0" }}>O seu nutricionista:</p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#111827",
                      margin: "0 0 20px 0",
                    }}
                  >
                    {connection.nutritionist.name}
                  </p>
                  <button
                    className="btn-submit"
                    onClick={() => setIsChatOpen(true)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      display: "flex",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <span>💬</span> Abrir Chat
                  </button>
                </div>
              ) : connection?.status === "PENDING" ? (
                <div className="empty-state">
                  <div
                    style={{
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                      padding: "8px 15px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      marginBottom: "15px",
                    }}
                  >
                    ⏳ Aguarda Aprovação
                  </div>
                  <p style={{ margin: 0 }}>Pedido enviado para:</p>
                  <p
                    style={{
                      fontWeight: "bold",
                      color: "#374151",
                      margin: "5px 0 0 0",
                    }}
                  >
                    {connection.nutritionist.name}
                  </p>
                </div>
              ) : (
                <>
                  {connectionMessage && (
                    <div
                      style={{
                        padding: "12px",
                        marginBottom: "15px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        backgroundColor:
                          connectionMessage.type === "error"
                            ? "#fef2f2"
                            : "#ecfdf5",
                        color:
                          connectionMessage.type === "error"
                            ? "#ef4444"
                            : "#10b981",
                        border: `1px solid ${connectionMessage.type === "error" ? "#fecaca" : "#a7f3d0"}`,
                      }}
                    >
                      {connectionMessage.text}
                    </div>
                  )}

                  <div
                    className="empty-state"
                    style={{ padding: "0 0 20px 0", gap: "10px" }}
                  >
                    <p style={{ margin: 0 }}>Ainda não tem nutricionista.</p>
                    <p style={{ fontSize: "13px", margin: 0 }}>
                      Pesquise o nome do profissional para enviar convite.
                    </p>
                  </div>

                  <div
                    className="input-group"
                    style={{ position: "relative", marginBottom: "15px" }}
                  >
                    <input
                      type="text"
                      placeholder="Ex: Ana Silva"
                      value={searchNutriName}
                      onChange={(e) => {
                        setSearchNutriName(e.target.value);
                        setSelectedNutriId(null);
                      }}
                    />

                    {isSearchingNutri && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#10b981",
                          marginTop: "5px",
                        }}
                      >
                        A pesquisar...
                      </div>
                    )}

                    {nutriResults.length > 0 && !selectedNutriId && (
                      <ul
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          backgroundColor: "white",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          listStyle: "none",
                          padding: 0,
                          margin: "4px 0 0 0",
                          maxHeight: "180px",
                          overflowY: "auto",
                          zIndex: 10,
                        }}
                      >
                        {nutriResults.map((nutri) => (
                          <li
                            key={nutri.id}
                            onClick={() => {
                              setSelectedNutriId(nutri.id);
                              setSearchNutriName(nutri.name);
                              setNutriResults([]);
                            }}
                            style={{
                              padding: "12px 15px",
                              cursor: "pointer",
                              borderBottom: "1px solid #f3f4f6",
                              transition: "background 0.1s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#f9fafb")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            {nutri.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    className="btn-submit"
                    onClick={handleRequestConnection}
                    disabled={isRequesting || !selectedNutriId}
                    style={{ width: "100%", padding: "12px" }}
                  >
                    {isRequesting ? "A enviar..." : "Enviar Convite"}
                  </button>
                </>
              )}
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

      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        otherUserId={connection?.nutritionist.id || null} 
        otherUserName={connection?.nutritionist.name || ''} 
        currentUserId={user?.id} 
      />
    </div>
  );
}
