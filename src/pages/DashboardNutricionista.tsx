/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { api } from "../services/api";
import "./Dashboard.css"; // Vamos reaproveitar os mesmos estilos do paciente
import { PatientDiaryModal } from "../components/PatientDiaryModal";
import { ChatModal } from "../components/ChatModal";

type Patient = {
  id: number;
  name: string;
  email: string;
};

type Connection = {
  id: number;
  status: "PENDING" | "ACTIVE" | "REJECTED";
  patient: Patient; // O back-end deve devolver os dados do paciente que fez o pedido
};

export function DashboardNutricionista() {
  const { user, signOut } = useContext(AuthContext);

  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [activePatients, setActivePatients] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null,
  );
  const [selectedPatientName, setSelectedPatientName] = useState("");

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPatientId, setChatPatientId] = useState<number | null>(null); // Alterado aqui
  const [chatPatientName, setChatPatientName] = useState("");

  // Busca todas as conexões vinculadas a este nutricionista
  async function fetchConnections() {
    setIsLoading(true);
    try {
      const response = await api.get("/api/connections/my-patient");
      const allConnections: Connection[] = response.data;

      // Filtra os convites pendentes e os pacientes já aceites
      setPendingRequests(allConnections.filter((c) => c.status === "PENDING"));
      setActivePatients(allConnections.filter((c) => c.status === "ACTIVE"));
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchConnections();
  }, []);

  // Atualiza o estado do convite usando Query Parameters
  async function handleUpdateStatus(
    connectionId: number,
    newStatus: "ACTIVE" | "REJECTED",
  ) {
    try {
      // Usamos PUT (ou POST, dependendo do seu Controller) e passamos o status na string do URL
      await api.put(
        `/api/connections/respond/${connectionId}?status=${newStatus}`,
      );
      fetchConnections();
    } catch (error) {
      console.error(`Erro ao atualizar convite para ${newStatus}:`, error);
      alert("Erro ao processar o pedido. Tente novamente.");
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-logo">VitaTech Pro</h1>
        <div className="header-user">
          <span className="user-greeting">Dr(a). {user?.name}</span>
          <button onClick={signOut} className="btn-logout">
            Sair
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div
          className="dashboard-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          }}
        >
          {/* Cartão de Pedidos Pendentes */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Convites Pendentes</h2>
              <span
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {pendingRequests.length}
              </span>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="empty-state">A carregar convites...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="empty-state">
                  Não tem convites pendentes de momento.
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
                  {pendingRequests.map((req) => (
                    <li
                      key={req.id}
                      style={{
                        padding: "15px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: "0 0 5px 0",
                            fontWeight: "bold",
                            color: "#111827",
                          }}
                        >
                          {req.patient.name}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "#6b7280",
                          }}
                        >
                          ID do Paciente: {req.patient.id}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => handleUpdateStatus(req.id, "ACTIVE")}
                          style={{
                            backgroundColor: "#10b981",
                            color: "white",
                            border: "none",
                            padding: "8px 15px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          Aceitar
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                          style={{
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "8px 15px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          Rejeitar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Cartão de Pacientes Ativos */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Os Meus Pacientes</h2>
              <span
                style={{
                  backgroundColor: "#d1fae5",
                  color: "#065f46",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {activePatients.length}
              </span>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="empty-state">A carregar pacientes...</div>
              ) : activePatients.length === 0 ? (
                <div className="empty-state">
                  Ainda não tem pacientes em acompanhamento.
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
                  {activePatients.map((conn) => (
                    <li
                      key={conn.id}
                      style={{
                        padding: "15px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: "0 0 5px 0",
                            fontWeight: "bold",
                            color: "#111827",
                          }}
                        >
                          {conn.patient.name}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "#6b7280",
                          }}
                        >
                          {conn.patient.email}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => {
                            setSelectedPatientId(conn.patient.id);
                            setSelectedPatientName(conn.patient.name);
                            setIsDiaryModalOpen(true);
                          }}
                          style={{
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            padding: "8px 15px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          Ver Diário
                        </button>
                        <button
                          style={{
                            backgroundColor: "#f3f4f6",
                            color: "#374151",
                            border: "1px solid #d1d5db",
                            padding: "8px 15px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                          onClick={() => {
                            setChatPatientId(conn.patient.id); // Guardamos o ID do paciente
                            setChatPatientName(conn.patient.name);
                            setIsChatOpen(true);
                          }}
                        >
                          💬 Chat
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <PatientDiaryModal
            isOpen={isDiaryModalOpen}
            onClose={() => {
              setIsDiaryModalOpen(false);
              setSelectedPatientId(null);
            }}
            patientId={selectedPatientId}
            patientName={selectedPatientName}
          />

          <ChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            otherUserId={chatPatientId} // Usamos a propriedade correta e a nova variável
            otherUserName={chatPatientName}
            currentUserId={user?.id}
          />
        </div>
      </main>
    </div>
  );
}
