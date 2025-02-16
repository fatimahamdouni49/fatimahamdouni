import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

// Definir la estructura de los campeones en el estado final
interface Champion {
  nombre: string;
  tipo: string;
  dificultad: string;
  rol: string;
  posicion: string;
}

// Definir la estructura de los datos crudos del CSV
interface RawChampion {
  apiname: string;
  herotype: string;
  difficulty: number;
  role: string;
  position: string;
}

const Reports: React.FC = () => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [difficulty, setDifficulty] = useState<string>("");
  const [heroType, setHeroType] = useState<string>("");
  const [filteredChampions, setFilteredChampions] = useState<Champion[]>([]);

  // Cargar el archivo CSV
  useEffect(() => {
    fetch("/src/data/200125_LoL_champion_data.csv")
      .then((response) => response.text())
      .then((data) => {
        Papa.parse<RawChampion>(data, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            console.log("✅ CSV cargado:", result.data);
            if (result.data.length > 0) {
              const processedData: Champion[] = result.data.map((champ) => ({
                nombre: champ.apiname,
                tipo: champ.herotype,
                dificultad: String(champ.difficulty),
                rol: champ.role,
                posicion: champ.position
              }));
              setChampions(processedData);
              setFilteredChampions(processedData);
            } else {
              console.error("❌ No se encontraron datos en el CSV.");
            }
          },
          error: (err: Error) => console.error("❌ Error al analizar el CSV:", err)
        });
      })
      .catch((err) => console.error("❌ Error al cargar el archivo CSV:", err));
  }, []);

  // Filtrar campeones cuando cambian los filtros
  useEffect(() => {
    let filtered = champions;
    if (difficulty) filtered = filtered.filter((c) => c.dificultad === difficulty);
    if (heroType) filtered = filtered.filter((c) => c.tipo === heroType);
    setFilteredChampions(filtered);
  }, [difficulty, heroType, champions]);

  const roleData = Object.entries(
    filteredChampions.reduce((acc, champ) => {
      acc[champ.rol] = (acc[champ.rol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const positionData = Object.entries(
    filteredChampions.reduce((acc, champ) => {
      acc[champ.posicion] = (acc[champ.posicion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE", "#FF66B2"];

  // Generar PDF con los datos filtrados
  const generatePDF = () => {
    if (filteredChampions.length === 0) {
      alert("No hay datos para generar el informe.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Informe de Campeones de League of Legends", 20, 20);

    const columns = ["Nombre", "Tipo", "Dificultad", "Rol", "Posición"];
    const data = filteredChampions.map((c) => [c.nombre, c.tipo, c.dificultad, c.rol, c.posicion]);

    autoTable(doc, {
      head: [columns],
      body: data,
      startY: 30
    });

    doc.save("informe_campeones.pdf");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Informes de Campeones</h2>
      <label>Dificultad:</label>
      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option value="">Todas</option>
        <option value="1">Baja</option>
        <option value="2">Media</option>
        <option value="3">Alta</option>
      </select>
      <label>Tipo:</label>
      <select value={heroType} onChange={(e) => setHeroType(e.target.value)}>
        <option value="">Todos</option>
        <option value="Mage">Mago</option>
        <option value="Fighter">Luchador</option>
        <option value="Assassin">Asesino</option>
        <option value="Marksman">Tirador</option>
        <option value="Tank">Tanque</option>
      </select>
      <br /><br />
      <button onClick={generatePDF}>Generar PDF</button>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
        {roleData.length > 0 && (
          <>
            <h3>Gráfico de Roles</h3>
            <BarChart width={500} height={300} data={roleData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </>
        )}

        {positionData.length > 0 && (
          <>
            <h3>Gráfico de Posiciones</h3>
            <PieChart width={400} height={400}>
              <Pie data={positionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {positionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
