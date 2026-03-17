"""Create MVP tables

Revision ID: 20260316_create_mvp_tables
Revises: 
Create Date: 2026-03-16 03:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


# revision identifiers, used by Alembic.
revision = '20260316_create_mvp_tables'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Tenants table
    op.create_table('tenants',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('display_name', sa.String(), nullable=False),
        sa.Column('state', sa.String(), nullable=False),
        sa.Column('tier', sa.String(), nullable=False),
        sa.Column('candidate_name', sa.String()),
        sa.Column('candidate_party', sa.String()),
        sa.Column('lga_count', sa.Integer()),
        sa.Column('config', JSONB(), default={}),
        sa.Column('status', sa.String(), default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.now())
    )
    
    # Users table
    op.create_table('users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id')),
        sa.Column('email', sa.String(), unique=True, nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('phone', sa.String()),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('assigned_lga', sa.String()),
        sa.Column('active', sa.Boolean(), default=True),
        sa.Column('last_login', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), default=sa.func.now())
    )


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('users')
    op.drop_table('tenants')