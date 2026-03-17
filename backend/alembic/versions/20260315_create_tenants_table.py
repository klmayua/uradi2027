"""Create tenants table

Revision ID: 20260315_create_tenants_table
Revises: 
Create Date: 2026-03-15 19:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = '20260315_create_tenants_table'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create tenants table
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


def downgrade() -> None:
    # Drop tenants table
    op.drop_table('tenants')