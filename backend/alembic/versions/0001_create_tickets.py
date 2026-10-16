"""create tickets table

Revision ID: 0001_create_tickets
Revises:
Create Date: 2026-10-16
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_create_tickets"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "tickets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True, server_default=""),
        sa.Column("priority", sa.String(20), nullable=True, server_default="MEDIUM"),
        sa.Column("status", sa.String(30), nullable=True, server_default="OPEN"),
        sa.Column("assignee", sa.String(120), nullable=True, server_default="Unassigned"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=True,
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("tickets")
