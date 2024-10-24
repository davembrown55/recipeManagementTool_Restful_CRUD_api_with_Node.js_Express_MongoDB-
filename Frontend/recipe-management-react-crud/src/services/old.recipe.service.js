import http from "../http-common";

class RecipeDataService {
  getAll(params) {
    return http.get("/recipes", {params});
  }

  get(id) {
    return http.get(`/recipes/${id}`);
  }

  create(data) {
    return http.post("/recipes", data);
  }

  update(id, data) {
    return http.put(`/recipes/${id}`, data);
  }

  delete(id) {
    return http.delete(`/recipes/${id}`);
  }

  deleteAll() {
    return http.delete(`/recipes`);
  }

  findByTitle(title) {
    return http.get(`/recipes?title=${title}`);
  }

  findByIngredient(ingredients) {
    return http.get(`/recipes?ingredients=${ingredients}`);
  }

  findByMaxCookingTime(maxCookingTime) {
    return http.get(`/recipes?maxCookingTime=${maxCookingTime}`);
  }

}

export default new RecipeDataService();
