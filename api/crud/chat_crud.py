import pytz
import datetime
from sqlalchemy.orm import Session
from models.models import Chat, Conversation, User, OrderAssignment, OrderAssignmentStatus, Order, Courier

# Retrieves the chat history for a specific user, including the last message in each conversation
async def get_user_chat_history(db: Session, user_id: int):
    conversations = db.query(Conversation).filter(
        (Conversation.participant1_id == user_id) | (Conversation.participant2_id == user_id)
    ).all()

    chat_history = []
    for conversation in conversations:
        other_user_id = conversation.participant1_id if conversation.participant1_id != user_id else conversation.participant2_id
        other_user = db.query(User).filter(User.id == other_user_id).first()

        
        last_message = db.query(Chat).filter(Chat.conversation_id == conversation.id).order_by(Chat.created_at.desc()).first()
        
        chat_history.append({
            "user": {
                "id": other_user.id,
                "username": other_user.username,
            },
            "last_message": last_message.message if last_message else "",
            "last_message_time": last_message.created_at if last_message else ""
        })

    return chat_history

# Retrieves users sorted by their role, filtering out the current user
async def get_users_sorted_by_role(db: Session, role: str, current_user_id: int):
    users = {
        "admins": db.query(User).filter(User.role == "administrator", User.id != current_user_id).all(),
        "owners": db.query(User).filter(User.role == "owner", User.id != current_user_id).all(),
        "couriers": db.query(User).filter(User.role == "courier", User.id != current_user_id).all(),
        "customers": db.query(User).filter(User.role == "customer", User.id != current_user_id).all(),
    }

    if role == "administrator":
        return users
    elif role == "owner":
        return {"admins": users["admins"]}
    elif role == "courier":
        return {"owners": users["owners"]}
    elif role == "customer":
        in_delivery_couriers = (
            db.query(User)
            .join(Courier, Courier.user_id == User.id)
            .join(OrderAssignment, OrderAssignment.courier_id == Courier.id)
            .join(Order, Order.id == OrderAssignment.order_id)
            .filter(
                Order.customer_id == current_user_id,
                OrderAssignment.status == OrderAssignmentStatus.in_delivery
            )
            .all()
        )
        
        if not in_delivery_couriers:
            print(f"No couriers currently delivering for customer ID {current_user_id}.")
        else:
            print(f"Found {len(in_delivery_couriers)} couriers currently delivering for customer ID {current_user_id}.")

        return {"couriers": in_delivery_couriers}
    else:
        return {}

# Creates a new conversation between two users
async def create_conversation(db: Session, user1_id: int, user2_id: int):
    conversation = Conversation(participant1_id=user1_id, participant2_id=user2_id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation

# Retrieves an existing conversation between two users
async def get_conversation(db: Session, user1_id: int, user2_id: int):
    return db.query(Conversation).filter(
        ((Conversation.participant1_id == user1_id) & (Conversation.participant2_id == user2_id)) |
        ((Conversation.participant1_id == user2_id) & (Conversation.participant2_id == user1_id))
    ).first()

# Creates a new message in a conversation with a timestamp in the local timezone
async def create_message(db: Session, conversation_id: int, sender_id: int, receiver_id: int, message: str):
    local_timezone = pytz.timezone("Europe/Sarajevo")
    local_now = datetime.datetime.now(local_timezone)

    chat_message = Chat(
        conversation_id=conversation_id,
        sender_id=sender_id,
        receiver_id=receiver_id,
        message=message,
        created_at=local_now.replace(tzinfo=None)
    )
    
    db.add(chat_message)
    db.commit()
    db.refresh(chat_message)
    return chat_message

# Sends a message in a conversation and broadcasts it to any active WebSocket connections
async def handle_send_message(db: Session, conversation_id: int, sender_id: int, receiver_id: int, message: str, connections: dict):
    if not message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    chat_message = await create_message(db, conversation_id, sender_id, receiver_id, message)
    
    if conversation_id in connections:
        for connection in connections[conversation_id]:
            await connection.send_text(chat_message.message)

    return chat_message

# Retrieves all messages in a specific conversation, ordered by creation time
async def get_conversation_messages(db: Session, conversation_id: int):
    return db.query(Chat).filter(Chat.conversation_id == conversation_id).order_by(Chat.created_at.asc()).all()

# Retrieves the last message in a specific conversation
async def get_last_message(db: Session, conversation_id: int):
    return db.query(Chat).filter(Chat.conversation_id == conversation_id).order_by(Chat.created_at.desc()).first()
