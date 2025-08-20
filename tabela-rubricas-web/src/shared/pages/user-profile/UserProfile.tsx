import { useNavigate, useParams } from "react-router-dom";
import { LayoutBaseDePagina } from "../../layouts";
import { useEffect, useState } from "react";
import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Container, Grid, IconButton, LinearProgress, TextField, Typography } from "@mui/material";
import { useVForm, type IVFormErros } from "../../forms";
import * as yup from "yup";
// import FacebookIcon from '@mui/icons-material/Facebook';
// import TwitterIcon from '@mui/icons-material/Twitter';
// import GoogleIcon from '@mui/icons-material/Google';
import { FerramentasDeDetalhe } from "../../components/ferramentas-de-detalhe/FerramentasDeDetalhe";
import { AuthService } from "../../services/auth/AuthService";

interface IUserInfo {
  id?: string;
  username: string;
  email: string;
  phone_number: string;
}

interface IChangePasswordForm {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

const formValidationSchema: yup.Schema<IUserInfo> = yup.object().shape({
  username: yup.string().required().min(3),
  email: yup.string().required().email(),
  phone_number: yup.string().required().min(11),
});

export const UserProfile: React.FC = () => {
    const { id = 'nova' } = useParams<'id'>();
    const navigate = useNavigate();
    const { formRef, save, saveAndClose, isSaveAndClose } = useVForm();
    
    const [user, setUser] = useState<IUserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [passwordForm, setPasswordForm] = useState<IChangePasswordForm>({
        old_password: '',
        new_password: '',
        confirm_new_password: '',
    });

    useEffect(() => {
    const storedUser = localStorage.getItem("APP_USER_INFO");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    }, []);

    if (!user) {
        return <p>Carregando informações do usuário...</p>;
    }

    const handleSave = async (dados: IUserInfo) => {
        formValidationSchema
            .validate(dados, { abortEarly: false })
            .then(async () => {
            setIsLoading(true);
            // update do perfil
            setUser(dados);
            localStorage.setItem("APP_USER_INFO", JSON.stringify(dados));

        // troca de senha, se algum campo estiver preenchido
        if (passwordForm.old_password || passwordForm.new_password || passwordForm.confirm_new_password) {
            if (passwordForm.new_password !== passwordForm.confirm_new_password) {
            alert("A nova senha e a confirmação não coincidem.");
            } else {
            const result = await AuthService.changePassword({
                old_password: passwordForm.old_password,
                new_password: passwordForm.new_password,
            });
            if (result instanceof Error) {
                alert(`Erro ao alterar senha: ${result.message}`);
            } else {
                alert("Senha alterada com sucesso!");
                setPasswordForm({ old_password: '', new_password: '', confirm_new_password: '' });
            }
            }
        }

        setIsLoading(false);
        })
        .catch((errors: yup.ValidationError) => {
        const ValidationErrors: IVFormErros = {};
        errors.inner.forEach(error => {
            if (!error.path) return;
            ValidationErrors[error.path] = error.message;
        });
        formRef.current?.setErrors(ValidationErrors);
        });
    };

    return (
    <LayoutBaseDePagina 
      titulo="Perfil do Usuário"
      barraDeFerramentas={
        <FerramentasDeDetalhe 
          textoBotaoNovo="Nova"
          mostrarBotaoSalvarEFechar
          mostrarBotaoNovo={false}
          mostrarBotaoApagar={false}
          aoClicarEmSalvar={() => handleSave(user)}
          aoClicarEmSalvarEFechar={() => { handleSave(user); saveAndClose(); }}
          aoClicarEmVoltar={() => navigate('/rubricas')}
        />
      }
    >
      {isLoading && <LinearProgress variant="indeterminate" />}
      <Container>
        <Grid container spacing={4}>
          <Grid item md={8}>
            <Card>
              <CardHeader title={<Typography variant="h5">Editar perfil</Typography>} />
              <CardContent>
                <Grid container spacing={2} direction="column">
                  <Grid item>
                    <TextField
                      fullWidth
                      label="Nome"
                      value={user.username}
                      onChange={(e) => setUser({ ...user, username: e.target.value })}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      disabled
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      fullWidth
                      label="Telefone"
                      value={user.phone_number}
                      onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                    fullWidth
                    label="Senha atual"
                    type="password"
                    value={passwordForm.old_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                    />
                  </Grid>
                    <Grid item>
                        <TextField
                        fullWidth
                        label="Nova senha"
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                        fullWidth
                        label="Confirmar nova senha"
                        type="password"
                        value={passwordForm.confirm_new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_new_password: e.target.value })}
                        />
                    </Grid>
                </Grid>
              </CardContent>
              <CardActions>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleSave(user)}
                >
                  Salvar
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item md={4}>
            <Card>
              <CardContent>
                <div style={{ textAlign: 'center' }}>
                  <Avatar
                    alt={user.username}
                    src="/path/to/image/emilyz.jpg" // futuramente pode vir da API
                    sx={{ width: 100, height: 100, margin: '0 auto 10px' }}
                  />
                  <Typography variant="h5">{user.username}</Typography>
                  <Typography variant="subtitle1">{user.email}</Typography>
                </div>
                <Typography variant="body2" style={{ marginTop: 10 }}>
                  Bem-vindo ao seu perfil! Aqui você pode atualizar suas informações pessoais.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </LayoutBaseDePagina>
  );
};