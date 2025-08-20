import { Api } from '../axios-config';

// export interface ICreateUserRequest {
//   name: string;
//   lastName: string;
//   email: string;
//   password: string;
//   universityId: string;
//   cargo: number;
//   CPF: string;
//   idade: number;
//   titulo: number;
//   tempoDeTrabalho: number;
// }

export interface IAuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    phone_number: string;
    last_access: Date;
    access_expiration: Date;
  };
}

export interface IChangePasswordRequest {
  old_password: string;
  new_password: string;
}

const auth = async (email: string, password: string): Promise<IAuthResponse | Error> => {
  try {
    const response = await Api.post('/login/', { email, password }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.status === 200) {
      return {
        access: response.data.access,
        refresh: response.data.refresh,
        user: {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          phone_number: response.data.phone_number,
          last_access: response.data.last_access,
          access_expiration: response.data.access_expiration
        },
      };
    }

    return new Error('Erro no login.');
  } catch (error: any) {
    console.error(error);
    // Pega a mensagem real do backend
    const msg =
      error.response?.data?.error ||
      error.message ||
      'Erro no login.';
    return new Error(msg);
  }
};

export const changePassword = async (data: IChangePasswordRequest): Promise<string | Error> => {
  const accessToken = localStorage.getItem('APP_ACCESS_TOKEN');
  if (!accessToken) {
    return new Error('Usuário não autenticado.');
  }

  try {
    const response = await Api.post('/change-password/', data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 200) {
      return response.data.success; // "Senha alterada com sucesso."
    }

    return new Error('Erro ao alterar a senha.');
  } catch (error: any) {
    console.error(error);
    const msg =
      error.response?.data?.error ||
      error.message ||
      'Erro ao alterar a senha.';
    return new Error(msg);
  }
};

export async function validateToken(): Promise<boolean> {
  const accessToken = localStorage.getItem('APP_ACCESS_TOKEN');
  if (!accessToken) {
      return false;
  }

  try {
      const response = await Api.get('/User/validate-token/', { headers: { Authorization: `Bearer ${accessToken}` } });
      return response.status === 200;
  } catch (error) {
      console.error('Token inválido ou expirado');
      localStorage.removeItem('APP_ACCESS_TOKEN');
      return false;
  }
}

export const AuthService = {
  auth,
  changePassword,
  // createUser,
  validateToken,
};

// async function createUser(userData: ICreateUserRequest): Promise<void> {
//   try {
//       const request = userData;
//       const response = await Api.post('/User/register', request );

//       if (response.status >= 200 && response.status < 300) {
//         alert("Usuário criado com sucesso!");
//       } else {
//           // Trata o caso de respostas fora da faixa 2xx
//           const errorMessage = response.data?.message || 'Erro desconhecido ao criar o usuário';
//           throw new Error(errorMessage);
//       }
//   } catch (error) {
//       console.error("Erro ao criar o usuário:", error);
//       alert(`Erro ao criar o usuário: ${error}`);
//   }
// }