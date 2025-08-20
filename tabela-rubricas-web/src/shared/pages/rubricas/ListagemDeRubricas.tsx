import { useNavigate, useSearchParams } from "react-router-dom"
import { FerramentasDaListagem } from "../../components"
import { LayoutBaseDePagina } from "../../layouts"
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../../hooks/UseDebounce";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, List, ListItem, ListItemText, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography } from "@mui/material";
import { Environment } from "../../environment";
import type { IListRubrica } from "../../services/rubricas/RubricasService";
import { rubricas } from "../../data/rubricas/Rubricas";
import { detalheRubricas } from "../../data/rubricas/DetalhesRubricas";
import AttachFileIcon from '@mui/icons-material/AttachFile';


export const ListagemDeRubricas: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce();
  const navigate = useNavigate();

  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<IListRubrica[]>([]);

  // estado do modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedRubrica, setSelectedRubrica] = useState<any | null>(null);

  const busca = useMemo(() => {
    return searchParams.get('busca') || '';
  }, [searchParams]);

  const pagina = useMemo(() => {
    return Number(searchParams.get('pagina') || '1');
  }, [searchParams]);

  // gera ids automáticos
  const detalheRubricasComId = detalheRubricas.map((d, index) => ({
    ...d,
    id: index + 1
  }));

  const rubricasComId = rubricas.map((r, index) => ({
    ...r,
    id: index + 1
  }));

  useEffect(() => {
    setIsLoading(true);

    debounce(() => {
      // Simula filtro e paginação local
      const filtered = rubricasComId
        .filter((item) =>
          item.nome.toLowerCase().includes(busca.toLowerCase()) ||
          item.natureza.toLowerCase().includes(busca.toLowerCase())
        );

      const total = filtered.length;
      const start = (pagina - 1) * Environment.LIMITE_DE_LINHAS;
      const end = start + Environment.LIMITE_DE_LINHAS;

      setRows(filtered.slice(start, end));
      setTotalCount(total);
      setIsLoading(false);
    });
  }, [busca, pagina]);

  // abre modal
  const handleOpenModal = (rubricaId: number) => {
    const rubrica = rubricasComId.find(r => r.id === rubricaId);
    const detalhes = detalheRubricasComId.find(d => d.id === rubricaId);

    setSelectedRubrica({ ...rubrica, ...detalhes });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRubrica(null);
  };

  return (
    <LayoutBaseDePagina
      titulo="Tabela de Rubricas"
      barraDeFerramentas={
        <FerramentasDaListagem
          mostrarInputBusca
          textoDaBusca={busca}
          textoBotaoNovo="Nova"
          aoClicarEmNovo={() => navigate("/universidades/detalhe/nova")}
          aoMudarTextoDeBusca={(texto) =>
            setSearchParams({ busca: texto, pagina: "1" }, { replace: true })
          }
        />
      }
    >
      <TableContainer component={Paper} variant="outlined" sx={{ m: 1, width: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ações</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Natureza</TableCell>
              <TableCell>INSS</TableCell>
              <TableCell>IRRF</TableCell>
              <TableCell>FGTS</TableCell>
              <TableCell>PIS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <IconButton onClick={() => handleOpenModal(row.id)}>
                    <AttachFileIcon />
                  </IconButton>
                </TableCell>
                <TableCell>{row.nome}</TableCell>
                <TableCell>{row.natureza}</TableCell>
                <TableCell>{row.inss}</TableCell>
                <TableCell>{row.irrf}</TableCell>
                <TableCell>{row.fgts}</TableCell>
                <TableCell>{row.pis}</TableCell>
              </TableRow>
            ))}
          </TableBody>

          {totalCount === 0 && !isLoading && <caption>{Environment.LISTAGEM_VAZIA}</caption>}

          <TableFooter>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7}>
                  <LinearProgress variant="indeterminate" />
                </TableCell>
              </TableRow>
            )}
            {totalCount > Environment.LIMITE_DE_LINHAS && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Pagination
                    page={pagina}
                    count={Math.ceil(totalCount / Environment.LIMITE_DE_LINHAS)}
                    onChange={(_, newPage) =>
                      setSearchParams({ busca, pagina: newPage.toString() }, { replace: true })
                    }
                  />
                </TableCell>
              </TableRow>
            )}
          </TableFooter>
        </Table>
      </TableContainer>

      {/* Modal de Detalhes */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedRubrica ? selectedRubrica.nome : "Detalhes da Rubrica"}
        </DialogTitle>
        <DialogContent dividers>
          {selectedRubrica && (
            <>
            <Paper
    elevation={1}
    sx={{
      p: 2,          // padding interno
      my: 0,         // margin vertical
      backgroundColor: 'grey.100', // cor de fundo leve
    }}
  >
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      {selectedRubrica.descricao}
    </Typography>
  </Paper>
              <List dense>
                {selectedRubrica.tipo && (
                  <ListItem>
                    <ListItemText primary="Tipo" secondary={selectedRubrica.tipo} />
                  </ListItem>
                )}
                {selectedRubrica.validade && (
                  <ListItem>
                    <ListItemText primary="Validade" secondary={selectedRubrica.validade} />
                  </ListItem>
                )}
                {selectedRubrica.natureza && (
                  <ListItem>
                    <ListItemText primary="Natureza" secondary={selectedRubrica.natureza} />
                  </ListItem>
                )}
              </List>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Tributo</strong></TableCell>
                    <TableCell><strong>Código</strong></TableCell>
                    <TableCell><strong>Base Legal</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>INSS</TableCell>
                    <TableCell>{selectedRubrica.inss?.cod ?? "-"}</TableCell>
                    <TableCell>{selectedRubrica.inss?.base_legal ?? "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>IRRF</TableCell>
                    <TableCell>{selectedRubrica.irrf?.cod ?? "-"}</TableCell>
                    <TableCell>{selectedRubrica.irrf?.base_legal ?? "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>FGTS</TableCell>
                    <TableCell>{selectedRubrica.fgts?.cod ?? "-"}</TableCell>
                    <TableCell>{selectedRubrica.fgts?.base_legal ?? "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>PIS</TableCell>
                    <TableCell>{selectedRubrica.pis?.cod ?? "-"}</TableCell>
                    <TableCell>{selectedRubrica.pis?.base_legal ?? "-"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
              <List dense>
                {selectedRubrica.repercute && (
                  <ListItem>
                    <ListItemText primary="Repercute" secondary={selectedRubrica.repercute} />
                  </ListItem>
                )}
                {selectedRubrica.multa && (
                  <ListItem>
                    <ListItemText primary="Multa" secondary={selectedRubrica.multa} />
                  </ListItem>
                )}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </LayoutBaseDePagina>
  );
}
