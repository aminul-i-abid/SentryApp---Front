export type TagResponse = {
    id: number;
    name: string;
    description: string;
    tag: string;
    created?: string;
    approved: number;
    company: {
        name: string;
    }[];
}; 