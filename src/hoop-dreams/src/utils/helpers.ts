
export const getIdFromUrl = (url: string): string => {
    const urlParts = url?.split('/') ?? [];
    if (urlParts?.length === 0) { 
        return '';
    }
    let id = urlParts[urlParts?.length - 1];

    if (isNaN(parseInt(id))) return '';

    return id;
}