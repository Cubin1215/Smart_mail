from flask import Blueprint, request, jsonify
from ..auth import AuthService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/signup", methods=["POST"])
async def signup():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        name = data.get("name")

        if not all([email, password, name]):
            return jsonify({"error": "Missing required fields"}), 400

        result = await AuthService.sign_up(email, password, name)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/signin", methods=["POST"])
async def signin():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not all([email, password]):
            return jsonify({"error": "Missing required fields"}), 400

        result = await AuthService.sign_in(email, password)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/signout", methods=["POST"])
async def signout():
    try:
        session_token = request.headers.get("Authorization")
        if not session_token:
            return jsonify({"error": "No session token provided"}), 401

        await AuthService.sign_out(session_token)
        return jsonify({"message": "Signed out successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/me", methods=["GET"])
async def get_current_user():
    try:
        session_token = request.headers.get("Authorization")
        if not session_token:
            return jsonify({"error": "No session token provided"}), 401

        user = await AuthService.get_current_user(session_token)
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(user.to_dict())

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/reset-password", methods=["POST"])
async def reset_password():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "Email is required"}), 400

        await AuthService.reset_password(email)
        return jsonify({"message": "Password reset email sent"})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/update-password", methods=["POST"])
async def update_password():
    try:
        data = request.get_json()
        new_password = data.get("new_password")
        session_token = request.headers.get("Authorization")

        if not all([new_password, session_token]):
            return jsonify({"error": "Missing required fields"}), 400

        await AuthService.update_password(new_password, session_token)
        return jsonify({"message": "Password updated successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 400 