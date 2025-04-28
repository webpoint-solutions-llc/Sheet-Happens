package types

type ApiResponese struct {
	Success bool `json:"success"`
	Payload any  `json:"payload"`
}

type LoginRequest struct {
	Email string `json:"email"`
}

type LoginResponse struct {
	Name string `json:"name"`
}
