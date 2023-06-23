import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "bootstrap/dist/css/bootstrap.css";
import "./RastreadorEstilo.css";
/* en la descripcion le deje que tambien pudiera escribir numero ya que aveces puede ser un codigo o por ejemplo en caso de gastos comunes puede ser 2 gas o en gasto
medico 2 paracetamol o otros */
const RastreadorDeGastos = () => {
  const [gastos, setGastos] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [gastoEditado, setGastoEditado] = useState(null);
  const presupuestoPorCategoria = {
    "Gastos de salud": 100000,
    "Gasto comunes": 120000,
    "Gastos de transporte": 50000,
    Arriendo: 350000,
    "Gasto personal": 100000,
  };
  /* Me base en lo que gasta mas o menos una peronas igual las personas veran reflejadas cuanto en promedio maximo deberia gastar una persona en base a una categoria igual la 
  esto es en base a una tabla de rangos que encontre en internet  */

  useEffect(() => {
    const gastosAlmacenados = JSON.parse(localStorage.getItem("gastos"));
    if (gastosAlmacenados && gastosAlmacenados.length > 0) {
      setGastos(gastosAlmacenados);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("gastos", JSON.stringify(gastos));
  }, [gastos]);

  const agregarGasto = (event) => {
    event.preventDefault();

    if (gastoEditado) {
      // Editar gasto existente
      const gastosActualizados = gastos.map((gasto) => {
        if (gasto.id === gastoEditado.id) {
          return {
            ...gasto,
            descripcion: descripcion,
            categoria: categoria,
            monto: monto,
            fecha: fecha,
          };
        }
        return gasto;
      });

      setGastos(gastosActualizados);
      setGastoEditado(null);
    } else {
      // Crear nuevo gasto
      const nuevoGasto = {
        id: Date.now(),
        descripcion: descripcion,
        categoria: categoria,
        monto: monto,
        fecha: fecha,
        marcado: false,
      };

      setGastos([...gastos, nuevoGasto]);
    }

    setDescripcion("");
    setCategoria("");
    setMonto("");
    setFecha("");
  };

  const cambiarDescripcion = (event) => {
    setDescripcion(event.target.value);
  };

  const cambiarCategoria = (event) => {
    setCategoria(event.target.value);
  };

  const cambiarMonto = (event) => {
    const valorNumerico = event.target.value.replace(/[^0-9]/g, "");
    setMonto(valorNumerico);
  };

  const cambiarFecha = (event) => {
    setFecha(event.target.value);
  };

  const editarGasto = (id) => {
    const gastoSeleccionado = gastos.find((gasto) => gasto.id === id);
    setGastoEditado(gastoSeleccionado);
    setDescripcion(gastoSeleccionado.descripcion);
    setCategoria(gastoSeleccionado.categoria);
    setMonto(gastoSeleccionado.monto);
    setFecha(gastoSeleccionado.fecha);
  };

  const eliminarGasto = (id) => {
    const shouldDelete = window.confirm("¿Estás seguro de eliminar el gasto?");
    if (shouldDelete) {
      const gastosActualizados = gastos.filter((gasto) => gasto.id !== id);
      setGastos(gastosActualizados);

      if (gastoEditado && gastoEditado.id === id) {
        setGastoEditado(null);
      }
    }
  };

  const cambiarMarcadoGasto = (id) => {
    const gastosActualizados = gastos.map((gasto) => {
      if (gasto.id === id) {
        return { ...gasto, marcado: !gasto.marcado };
      }
      return gasto;
    });

    setGastos(gastosActualizados);

    if (gastoEditado && gastoEditado.id === id) {
      setGastoEditado(null);
    }
  };

  const calcularTotalGastosMarcados = () => {
    const totalGastosMarcados = gastos.reduce((total, gasto) => {
      if (gasto.marcado) {
        return total + parseInt(gasto.monto);
      }
      return total;
    }, 0);
    return totalGastosMarcados;
  };

  const generarInforme = () => {
    const shouldGenerate = window.confirm(
      "Ten en cuenta que solo se tomarán los gastos marcados (se dará el total para cada categoría). ¿Desea continuar?"
    );

    if (shouldGenerate) {
      const categorias = {};
      gastos.forEach((gasto) => {
        if (gasto.marcado) {
          if (categorias[gasto.categoria]) {
            categorias[gasto.categoria] += parseInt(gasto.monto);
          } else {
            categorias[gasto.categoria] = parseInt(gasto.monto);
          }
        }
      });

      const informe = Object.entries(categorias).map(([categoria, total]) => {
        const presupuesto = presupuestoPorCategoria[categoria] || 0;
        const restante = presupuesto - total;
        const estado = restante >= 0 ? "Dentro del presupuesto" : "Excedido del presupuesto";
        return `${categoria}: $${total} (${estado}) - Presupuesto: $${presupuesto}`;
      });

      alert(informe.join("\n"));
    }
  };

  return (
    <div className="expense-tracker-container order-sm-first order-lg-last text-center" id="Fondo1">
      <Container className="mt-5">
        <h2 className="text-center mb-4">Seguimiento de gastos</h2>
        <Row className="justify-content-center">
          <Col xs={12} md={6}>
            <Form onSubmit={agregarGasto}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Descripción"
                  value={descripcion}
                  onChange={cambiarDescripcion}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Select
                  value={categoria}
                  onChange={cambiarCategoria}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="Gastos de salud">Gastos de salud </option>
                  <option value="Gasto comunes">Gasto comunes</option>
                  <option value="Gastos de transporte">Gastos de transporte</option>
                  <option value="Arriendo">Arriendo</option>
                  <option value="Gasto personal">Gasto personales/otros </option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Monto"
                  value={monto}
                  onChange={cambiarMonto}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="date"
                  placeholder="Fecha"
                  value={fecha}
                  onChange={cambiarFecha}
                  required
                />
              </Form.Group>
              <div className="d-flex justify-content-between">
                <Button
                  variant="primary"
                  type="submit"
                  className="button-animation mt-3"
                >
                  {gastoEditado ? "Guardar cambios" : "Agregar gasto"}
                </Button>
                <Button
                  variant="primary"
                  type="button"
                  className="button-animation mt-3"
                  onClick={generarInforme}
                >
                  Generar informe
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
        <Row className="mt-4 justify-content-center">
          <Col xs={12} className="d-flex flex-wrap justify-content-center">
            <TransitionGroup component={null}>
              {gastos.map((gasto) => (
                <CSSTransition key={gasto.id} classNames="fade" timeout={300}>
                  <Col xs={12} md={6} lg={4} className="mb-3 d-flex justify-content-center">
                    <Card className={gasto.marcado ? "marked-card" : ""}>
                      <Card.Header className="d-flex justify-content-end">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => editarGasto(gasto.id)}
                          className="mx-1"
                        >
                          Editar <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => eliminarGasto(gasto.id)}
                          className="mx-1"
                        >
                          <i className="bi bi-x-circle"></i>
                        </Button>
                      </Card.Header>
                      <Card.Body>
                        <Card.Title>{gasto.descripcion}</Card.Title>
                        <Card.Text>Categoría: {gasto.categoria}</Card.Text>
                        <Card.Text>Monto: ${gasto.monto}</Card.Text>
                        <Card.Text>Fecha: {gasto.fecha}</Card.Text>
                      </Card.Body>
                      <Card.Footer>
                        <Form.Check
                          type="checkbox"
                          label="Marcar gasto para generar informe"
                          checked={gasto.marcado}
                          onChange={() => cambiarMarcadoGasto(gasto.id)}
                        />
                      </Card.Footer>
                    </Card>
                  </Col>
                </CSSTransition>
              ))}
            </TransitionGroup>
          </Col>
        </Row>
        <Row className="mt-4 order-sm-first order-lg-last">
          <Col xs={12} className="text-center">
            <div className="d-flex justify-content-center">
              <Col xs={12} md={6} className="text-center">
                <h4>Total de gastos marcados: ${calcularTotalGastosMarcados()}</h4>
              </Col>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RastreadorDeGastos;
