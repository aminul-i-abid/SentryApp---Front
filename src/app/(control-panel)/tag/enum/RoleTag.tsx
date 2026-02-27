const tagRoleMap: Record<number, string> = {
    0: 'Gerente',
    1: 'Supervisor',
    2: 'Trabajador'
};

// Add reverse mapping for roles
export const reverseTagRoleMap: { [key: string]: string } = {
    'Trabajador': 'CategoriaC',
    'Supervisor': 'CategoriaB',
    'Gerente': 'CategoriaA'
};

export const categoryToRoleMap: { [key: string]: string } = {
    'CategoriaC': 'Trabajador',
    'CategoriaB': 'Supervisor',
    'CategoriaA': 'Gerente'
};

export default tagRoleMap;
