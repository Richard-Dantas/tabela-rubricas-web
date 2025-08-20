import { Environment } from "../../environment";
import { Api } from "../axios-config";

export interface IListRubrica {
  id: number;
  nome: string;
  natureza: string;
  inss: number;
  irrf: number;
  fgts: number;
  pis: number;
}

type TRubricas = {
    data: IListRubrica[];
    totalCount: number;
}

const getAll = async (page = 1, filter = ''): Promise<TRubricas | Error> => {
    try {
        var urlRelativa = `/University?pageNumber=${page}`;
        if (filter){
            urlRelativa += `&name=${filter}`;
        }

        const { data, headers } = await Api.get(urlRelativa);

        if (data) {
            return{
                data,
                totalCount: Number(headers['x-total-count'] || Environment.LIMITE_DE_LINHAS),
            }
        }
        return new Error('Erro ao listar os registros.');
    } catch (error) {
        return new Error((error as { message: string }).message || 'Erro ao listar os registros.');
    }
};

export const RubricaService = {
    getAll,
};