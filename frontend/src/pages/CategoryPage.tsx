import React, { useState, useEffect } from "react";
import { 
  fetchCategories as apiFetchCategories, 
  createCategory, 
  deleteCategory, 
  updateCategory // Ensure this is exported from your api.ts
} from "../services/api";
import { Category } from "../types";
import { Modal, Button } from "../vibes";
import { COLORS } from "../constants/colors";

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  // Track which category we are editing; null means we are creating a new one
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiFetchCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setNewCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setNewCategoryName("");
    }
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, newCategoryName);
      } else {
        await createCategory(newCategoryName);
      }
      setNewCategoryName("");
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      alert("Failed to save category. It might already exist.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure? This may fail if expenses are linked to this category.")) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (error) {
      alert("Cannot delete category while expenses are linked to it.");
    }
  };

  // --- STYLES ---
  const pageStyle: React.CSSProperties = { padding: "48px 64px", minHeight: "100vh", background: COLORS.secondary.s01 };
  const headerStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" };
  const titleStyle: React.CSSProperties = { fontSize: "40px", fontWeight: 700, color: COLORS.secondary.s10, margin: 0 };
  const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" };
  const cardStyle: React.CSSProperties = { background: "white", padding: "24px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" };
  const actionsStyle: React.CSSProperties = { display: "flex", gap: "12px" };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Manage Categories</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          New Category
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: COLORS.secondary.s08 }}>Loading...</div>
      ) : (
        <div style={gridStyle}>
          {categories.map((cat) => (
            <div key={cat.id} style={cardStyle}>
              <span style={{ fontWeight: 600, color: COLORS.secondary.s10 }}>{cat.name}</span>
              <div style={actionsStyle}>
                <button 
                  onClick={() => handleOpenModal(cat)}
                  style={{ color: COLORS.primary.p08, border: "none", background: "none", cursor: "pointer", fontWeight: 500 }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(cat.id)}
                  style={{ color: "red", border: "none", background: "none", cursor: "pointer", fontWeight: 500 }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSaveCategory} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            type="text"
            placeholder="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            autoFocus
            style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${COLORS.secondary.s03}` }}
          />
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editingCategory ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;