import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { api } from '../services/api';

// Tipagem baseada na especificação do backend[cite: 2]
type Food = {
  id: number;
  name: string;
};

type SelectedFood = {
  foodId: number;
  name: string;
  quantityGrams: number;
};

type MealModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // Data escolhida no painel
  onSuccess: () => void; // Função para atualizar a lista após guardar
};

export function MealModal({ isOpen, onClose, selectedDate, onSuccess }: MealModalProps) {
  const [mealType, setMealType] = useState('LUNCH');
  const [time, setTime] = useState('12:00');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  
  const [selectedItems, setSelectedItems] = useState<SelectedFood[]>([]);
  const [quantity, setQuantity] = useState<number | ''>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Pesquisa alimentos no catálogo[cite: 2]
  async function handleSearch() {
    if (!searchQuery) return;
    try {
      const response = await api.get('/api/foods/search', {
        params: { name: searchQuery, page: 0, size: 10 } // Paginação conforme documento[cite: 1, 2]
      });
      // Assumindo que o Spring Data devolve a lista dentro de "content" (padrão de paginação)
      setSearchResults(response.data.content || response.data); 
    } catch (error) {
      console.error("Erro ao pesquisar alimentos:", error);
    }
  }

  // Adiciona o alimento à lista local do modal
  function handleAddItem(food: Food) {
    if (!quantity || quantity <= 0) {
      alert("Por favor, insira a quantidade em gramas.");
      return;
    }
    
    setSelectedItems(prev => [
      ...prev, 
      { foodId: food.id, name: food.name, quantityGrams: Number(quantity) }
    ]);
    
    // Limpa a pesquisa para o próximo item
    setSearchQuery('');
    setSearchResults([]);
    setQuantity('');
  }

  // Regista a refeição no backend[cite: 2]
  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert("Adicione pelo menos um alimento à refeição.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Junta a data do painel com a hora do modal e formata para ISO 8601[cite: 3]
      const consumedAtDate = new Date(`${selectedDate}T${time}:00`);
      
      const payload = {
        mealType,
        consumedAt: consumedAtDate.toISOString(), // Formato ISO 8601 exigido[cite: 3]
        items: selectedItems.map(item => ({
          foodId: item.foodId,
          quantityGrams: item.quantityGrams
        }))
      };

      await api.post('/api/meals', payload); // Chamada de criação[cite: 2]
      onSuccess(); // Atualiza a lista no painel
      onClose(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao guardar refeição:", error);
      alert("Erro ao guardar refeição.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Registar Refeição</h2>
          <button onClick={onClose} className="btn-close">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="input-group" style={{ flex: 1 }}>
              <label>Tipo de Refeição</label>
              <select value={mealType} onChange={e => setMealType(e.target.value)} required>
                <option value="BREAKFAST">Pequeno-almoço</option>
                <option value="LUNCH">Almoço</option>
                <option value="SNACK">Lanche</option>
                <option value="DINNER">Jantar</option>
              </select>
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Hora</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '10px' }}>
            <label>Pesquisar Alimento</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Ex: Arroz branco" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ flex: 2 }}
              />
              <input 
                type="number" 
                placeholder="Gramas (g)" 
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value) || '')}
                style={{ flex: 1 }}
              />
              <button type="button" onClick={handleSearch} className="btn-add" style={{ padding: '0 15px' }}>
                🔍
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.map(food => (
                <li key={food.id} className="search-result-item">
                  <span>{food.name}</span>
                  <button type="button" onClick={() => handleAddItem(food)} className="btn-add" style={{ padding: '4px 10px' }}>
                    Adicionar
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedItems.length > 0 && (
            <div className="selected-items">
              <h4>Alimentos Adicionados:</h4>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                {selectedItems.map((item, idx) => (
                  <li key={idx}>{item.name} - {item.quantityGrams}g</li>
                ))}
              </ul>
            </div>
          )}

          <button type="submit" className="btn-submit" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'A Guardar...' : 'Guardar Refeição'}
          </button>
        </form>
      </div>
    </div>
  );
}